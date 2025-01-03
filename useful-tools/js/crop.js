// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const cropSection = document.getElementById('cropSection');
const cropImage = document.getElementById('cropImage');
const ratioButtons = document.querySelectorAll('.ratio-btn');
const ratioWidth = document.getElementById('ratioWidth');
const ratioHeight = document.getElementById('ratioHeight');
const formatButtons = document.querySelectorAll('.format-btn');
const cropBtn = document.getElementById('cropBtn');

let cropper = null;
let customRatioTimeout = null;

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
    const reader = new FileReader();
    reader.onload = (e) => {
        cropImage.src = e.target.result;
        cropSection.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // 初始化裁剪器
        if (cropper) {
            cropper.destroy();
        }
        
        cropper = new Cropper(cropImage, {
            aspectRatio: NaN,
            viewMode: 1,
            autoCropArea: 1,
            background: false,
            responsive: true,
            restore: false,
            preview: '.preview-image',
            ready() {
                console.log('Cropper is ready');
            },
            crop() {
                console.log('Cropping');
            }
        });
    };
    reader.readAsDataURL(file);
}

// 裁剪比例按钮事件
ratioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        ratioButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 清空自定义比例输入框
        ratioWidth.value = '';
        ratioHeight.value = '';
        
        const ratio = btn.dataset.ratio;
        if (cropper) {
            if (ratio === 'free') {
                cropper.setAspectRatio(NaN);
            } else {
                const [width, height] = ratio.split(':');
                cropper.setAspectRatio(width / height);
            }
        }
    });
});

// 自定义比例输入事件
function handleCustomRatio() {
    const width = parseFloat(ratioWidth.value);
    const height = parseFloat(ratioHeight.value);
    
    if (width > 0 && height > 0) {
        // 取消所有预设比例按钮的选中状态
        ratioButtons.forEach(btn => btn.classList.remove('active'));
        
        // 设置新的裁剪比例
        if (cropper) {
            cropper.setAspectRatio(width / height);
        }
    }
}

// 添加输入延迟处理，避免频繁更新
function debounceCustomRatio() {
    if (customRatioTimeout) {
        clearTimeout(customRatioTimeout);
    }
    customRatioTimeout = setTimeout(handleCustomRatio, 300);
}

// 监听自定义比例输入
ratioWidth.addEventListener('input', debounceCustomRatio);
ratioHeight.addEventListener('input', debounceCustomRatio);

// 输入框验证
function validateInput(input) {
    const value = input.value;
    if (value < 1) {
        input.value = 1;
    }
}

ratioWidth.addEventListener('blur', () => validateInput(ratioWidth));
ratioHeight.addEventListener('blur', () => validateInput(ratioHeight));

// 导出格式按钮事件
formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 裁剪按钮事件
cropBtn.addEventListener('click', () => {
    if (!cropper) return;
    
    const format = document.querySelector('.format-btn.active').dataset.format;
    const mimeType = `image/${format}`;
    const quality = format === 'png' ? 1 : 0.9;
    
    const canvas = cropper.getCroppedCanvas();
    const dataUrl = canvas.toDataURL(mimeType, quality);
    
    // 下载裁剪后的图片
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `cropped_image_${timestamp}.${format}`;
    link.href = dataUrl;
    link.click();
}); 