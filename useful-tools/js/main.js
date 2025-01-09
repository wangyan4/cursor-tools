// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewSection = document.getElementById('previewSection');
const imageList = document.getElementById('imageList');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let imageItems = [];
const MAX_IMAGES = 10;

// 上传区域事件处理
uploadArea.addEventListener('click', () => {
    if (imageItems.length >= MAX_IMAGES) {
        alert(`最多只能上传${MAX_IMAGES}张图片`);
        return;
    }
    imageInput.click();
});

// 拖拽上传处理
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.querySelector('.upload-box').style.borderColor = '#0071e3';
    uploadArea.querySelector('.upload-box').style.backgroundColor = 'rgba(0,113,227,0.05)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.querySelector('.upload-box').style.borderColor = '#e5e5e5';
    uploadArea.querySelector('.upload-box').style.backgroundColor = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.querySelector('.upload-box').style.borderColor = '#e5e5e5';
    uploadArea.querySelector('.upload-box').style.backgroundColor = 'transparent';
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleFiles(files);
});

// 文件选择处理
imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
});

// 处理文件函数
function handleFiles(files) {
    if (imageItems.length + files.length > MAX_IMAGES) {
        alert(`最多只能上传${MAX_IMAGES}张图片`);
        return;
    }

    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageItem = createImageItem(file, e.target.result);
            imageItems.push(imageItem);
            imageList.appendChild(imageItem.element);
            previewSection.style.display = 'block';
            compressImage(imageItem);
        };
        reader.readAsDataURL(file);
    });
}

// 创建图片项
function createImageItem(file, src) {
    const div = document.createElement('div');
    div.className = 'image-item';
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    
    const img = document.createElement('img');
    img.src = src;
    
    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = formatFileSize(file.size);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    
    const progress = document.createElement('div');
    progress.className = 'progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progress.appendChild(progressBar);
    
    previewContainer.appendChild(img);
    div.appendChild(previewContainer);
    div.appendChild(info);
    div.appendChild(removeBtn);
    div.appendChild(progress);
    
    const imageItem = {
        element: div,
        file: file,
        originalImage: null,
        compressedImage: null,
        progressBar: progressBar,
        info: info
    };
    
    removeBtn.onclick = () => {
        const index = imageItems.indexOf(imageItem);
        if (index > -1) {
            imageItems.splice(index, 1);
            div.remove();
            if (imageItems.length === 0) {
                previewSection.style.display = 'none';
            }
        }
    };
    
    return imageItem;
}

// 压缩图片
async function compressImage(imageItem) {
    const img = new Image();
    img.src = URL.createObjectURL(imageItem.file);
    
    img.onload = () => {
        imageItem.originalImage = img;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const quality = qualitySlider.value / 100;
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // 计算压缩后大小
        const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
        const compressedBytes = base64Length * 0.75;
        
        imageItem.compressedImage = compressedDataUrl;
        imageItem.info.textContent = `${formatFileSize(imageItem.file.size)} → ${formatFileSize(compressedBytes)}`;
        imageItem.progressBar.style.width = '100%';
    };
}

// 下载压缩后的图片
downloadBtn.addEventListener('click', () => {
    if (imageItems.length === 0) return;
    
    if (imageItems.length === 1) {
        // 单张图片直接下载
        const link = document.createElement('a');
        link.download = `compressed_${Date.now()}.jpg`;
        link.href = imageItems[0].compressedImage;
        link.click();
    } else {
        // 多张图片打包下载
        const zip = new JSZip();
        imageItems.forEach((item, index) => {
            const base64Data = item.compressedImage.split(',')[1];
            zip.file(`compressed_${index + 1}.jpg`, base64Data, {base64: true});
        });
        
        zip.generateAsync({type: 'blob'}).then(content => {
            const link = document.createElement('a');
            link.download = `compressed_images_${Date.now()}.zip`;
            link.href = URL.createObjectURL(content);
            link.click();
        });
    }
});

// 更新滑动条进度条
function updateSliderProgress(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${value}%, #e5e5e5 ${value}%, #e5e5e5 100%)`;
}

// 监听滑动条变化
qualitySlider.addEventListener('input', function() {
    qualityValue.textContent = `${this.value}%`;
    updateSliderProgress(this);
    imageItems.forEach(item => compressImage(item));
});

// 初始化滑动条进度
updateSliderProgress(qualitySlider);

// 文件大小格式化函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 