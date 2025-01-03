// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const resizeSection = document.getElementById('resizeSection');
const imageList = document.getElementById('imageList');
const modeButtons = document.querySelectorAll('.mode-btn');
const scaleOptions = document.getElementById('scaleOptions');
const sizeOptions = document.getElementById('sizeOptions');
const scaleRatio = document.getElementById('scaleRatio');
const sizeMode = document.getElementById('sizeMode');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const formatButtons = document.querySelectorAll('.format-btn');
const resizeBtn = document.getElementById('resizeBtn');
const singleSizeInput = document.getElementById('singleSizeInput');
const singleSizeValue = document.getElementById('singleSizeValue');
const singleSizeLabel = document.getElementById('singleSizeLabel');

let uploadedImages = [];

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
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        handleImages(files);
    }
});

// 文件选择处理
imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleImages(files);
    }
});

// 图片处理函数
function handleImages(files) {
    resizeSection.style.display = 'block';
    uploadArea.style.display = 'none';

    // 初始状态设置
    scaleOptions.style.display = 'block';
    sizeOptions.style.display = 'none';
    document.querySelector('.size-inputs').style.display = 'none';  // 隐藏宽度和高度输入框

    // 确保"按比例缩放"按钮处于激活状态
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === 'scale') {
            btn.classList.add('active');
        }
    });

    // 设置默认缩放比例
    scaleRatio.value = '100';
    scaleValue.textContent = '100%';
    // 初始化滑动条进度条样式
    const value = (scaleRatio.value - scaleRatio.min) / (scaleRatio.max - scaleRatio.min) * 100;
    scaleRatio.style.backgroundSize = `${value}% 100%`;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.src = e.target.result;
            image.onload = () => {
                uploadedImages.push({
                    file: file,
                    image: image,
                    originalWidth: image.width,
                    originalHeight: image.height
                });
                
                // 添加图片预览
                addImagePreview(file.name, image);
            };
        };
        reader.readAsDataURL(file);
    });
}

// 添加图片预览
function addImagePreview(name, image) {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.innerHTML = `
        <div class="image-preview">
            <img src="${image.src}" alt="${name}">
        </div>
        <div class="image-info">
            <div class="image-name">${name}</div>
            <div>${image.width} × ${image.height}</div>
        </div>
    `;
    imageList.appendChild(item);
}

// 获取缩放值显示元素
const scaleValue = document.getElementById('scaleValue');

scaleRatio.addEventListener('input', () => {
    scaleValue.textContent = `${scaleRatio.value}%`;
    // 更新滑动条的背景进度
    const value = (scaleRatio.value - scaleRatio.min) / (scaleRatio.max - scaleRatio.min) * 100;
    scaleRatio.style.backgroundSize = `${value}% 100%`;
});

// 初始化滑动条进度
scaleRatio.style.backgroundSize = '50% 100%';

// 调整模式切换
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        // 重置所有输入值
        scaleRatio.value = '100';
        scaleValue.textContent = '100%';  // 更新显示的值
        widthInput.value = '';
        heightInput.value = '';
        singleSizeValue.value = '';
        
        if (mode === 'scale') {
            scaleOptions.style.display = 'block';
            sizeOptions.style.display = 'none';
            // 隐藏尺寸输入区域
            document.querySelector('.size-inputs').style.display = 'none';
        } else {
            scaleOptions.style.display = 'none';
            sizeOptions.style.display = 'block';
            // 显示尺寸输入区域
            document.querySelector('.size-inputs').style.display = 'block';
            // 触发尺寸模式的change事件，以正确显示输入框
            sizeMode.dispatchEvent(new Event('change'));
        }
    });
});

// 尺寸模式切换
sizeMode.addEventListener('change', () => {
    const mode = sizeMode.value;
    // 重置输入框状态
    widthInput.value = '';
    heightInput.value = '';
    singleSizeValue.value = '';

    switch (mode) {
        case 'fixed':
            // 固定尺寸：宽度和高度都可以输入
            widthInput.parentElement.style.display = 'block';
            heightInput.parentElement.style.display = 'block';
            singleSizeInput.style.display = 'none';
            widthInput.disabled = false;
            heightInput.disabled = false;
            widthInput.placeholder = '像素';
            heightInput.placeholder = '像素';
            break;

        case 'width':
            // 固定宽度：只能输入宽度，高度自动计算
            widthInput.parentElement.style.display = 'block';
            heightInput.parentElement.style.display = 'block';
            singleSizeInput.style.display = 'none';
            widthInput.disabled = false;
            heightInput.disabled = true;
            widthInput.placeholder = '像素';
            heightInput.placeholder = '自动计算';
            break;

        case 'height':
            // 固定高度：只能输入高度，宽度自动计算
            widthInput.parentElement.style.display = 'block';
            heightInput.parentElement.style.display = 'block';
            singleSizeInput.style.display = 'none';
            widthInput.disabled = true;
            heightInput.disabled = false;
            widthInput.placeholder = '自动计算';
            heightInput.placeholder = '像素';
            break;

        case 'long':
        case 'short':
            // 固定最长/最短边：只需输入一个值
            widthInput.parentElement.style.display = 'none';
            heightInput.parentElement.style.display = 'none';
            singleSizeInput.style.display = 'block';
            singleSizeLabel.textContent = mode === 'long' ? '最长边' : '最短边';
            singleSizeValue.placeholder = '像素';
            break;
    }
});

// 调整图片尺寸
function resizeImage(image, options) {
    const canvas = document.createElement('canvas');
    let newWidth, newHeight;

    if (options.mode === 'scale') {
        const scale = options.scale / 100;
        newWidth = image.width * scale;
        newHeight = image.height * scale;
    } else {
        switch (options.sizeMode) {
            case 'fixed':
                newWidth = options.width;
                newHeight = options.height;
                break;
            case 'width':
                newWidth = options.width;
                newHeight = (image.height * options.width) / image.width;
                break;
            case 'height':
                newHeight = options.height;
                newWidth = (image.width * options.height) / image.height;
                break;
            case 'long':
            case 'short':
                const targetSize = options.singleSize;
                const isLong = options.sizeMode === 'long';
                const referenceSide = isLong ? 
                    Math.max(image.width, image.height) : 
                    Math.min(image.width, image.height);
                const scale = targetSize / referenceSide;
                newWidth = image.width * scale;
                newHeight = image.height * scale;
                break;
        }
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    
    return canvas;
}

// 调整按钮事件
resizeBtn.addEventListener('click', () => {
    if (uploadedImages.length === 0) return;

    const mode = document.querySelector('.mode-btn.active').dataset.mode;
    const format = document.querySelector('.format-btn.active').dataset.format;
    const options = {
        mode: mode,
        scale: parseFloat(scaleRatio.value),
        sizeMode: sizeMode.value,
        width: parseInt(widthInput.value),
        height: parseInt(heightInput.value),
        singleSize: parseInt(singleSizeValue.value)
    };

    // 创建ZIP文件
    const zip = new JSZip();
    const promises = uploadedImages.map(item => {
        return new Promise(resolve => {
            const canvas = resizeImage(item.image, options);
            canvas.toBlob(blob => {
                const fileName = `${item.file.name.split('.')[0]}_resized.${format}`;
                zip.file(fileName, blob);
                resolve();
            }, `image/${format}`, format === 'png' ? 1 : 0.92);
        });
    });

    Promise.all(promises).then(() => {
        zip.generateAsync({type: 'blob'}).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'resized_images.zip';
            link.click();
        });
    });
});

// 导出格式按钮事件
formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 修改导出格式按钮样式
formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有按钮的active状态
        formatButtons.forEach(b => b.classList.remove('active'));
        // 给当前点击的按钮添加active状态
        btn.classList.add('active');
    });
});

// 添加一个"添加更多图片"按钮
const addMoreBtn = document.createElement('button');
addMoreBtn.className = 'add-more-btn';
addMoreBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
    添加更多图片
`;

// 将按钮添加到控制区域
document.querySelector('.resize-controls .control-group').appendChild(addMoreBtn);

// 添加按钮点击事件
addMoreBtn.addEventListener('click', () => {
    imageInput.click();
}); 