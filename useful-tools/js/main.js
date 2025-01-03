// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let originalImage = null;

// 上传区域事件处理
uploadArea.addEventListener('click', () => {
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
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImage(file);
    }
});

// 文件选择处理
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImage(file);
    }
});

// 图片处理函数
function handleImage(file) {
    // 显示原始文件大小
    originalSize.textContent = formatFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            originalPreview.src = originalImage.src;
            compressImage();
            previewSection.style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
}

// 压缩图片函数
function compressImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 保持原始宽高比
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    ctx.drawImage(originalImage, 0, 0);
    
    const quality = qualitySlider.value / 100;
    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    
    compressedPreview.src = compressedDataUrl;
    
    // 计算压缩后文件大小
    const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
    const compressedBytes = base64Length * 0.75;
    compressedSize.textContent = formatFileSize(compressedBytes);
}

// 质量滑块事件
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
    if (originalImage) {
        compressImage();
    }
});

// 下载按钮事件
downloadBtn.addEventListener('click', () => {
    if (!compressedPreview.src) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `compressed_image_${timestamp}.jpg`;
    link.href = compressedPreview.src;
    link.click();
});

// 文件大小格式化函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 