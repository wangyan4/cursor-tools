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
    if (file && file.type.startsWith('image/') && validateFile(file)) {
        handleImage(file);
    }
});

// 文件选择处理
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
        handleImage(file);
    }
});

// 添加文件验证函数
function validateFile(file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return false;
    }
    
    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('图片大小不能超过10MB');
        return false;
    }
    
    return true;
}

// 添加错误处理函数
function handleError(error) {
    console.error('发生错误:', error);
    alert('处理图片时发生错误，请重试');
    
    // 重置界面状态
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropSection.style.display = 'none';
    uploadArea.style.display = 'block';
}

// 图片处理函数
function handleImage(file) {
    try {
        // 重置裁剪区域内容
        cropSection.innerHTML = `
            <div class="crop-container">
                <!-- 裁剪控制区域 -->
                <div class="crop-controls">
                    <div class="control-group">
                        <div class="aspect-ratio-control">
                            <label>裁剪比例</label>
                            <div class="ratio-buttons">
                                <button class="ratio-btn active" data-ratio="free">自由</button>
                                <button class="ratio-btn" data-ratio="1:1">1:1</button>
                                <button class="ratio-btn" data-ratio="4:3">4:3</button>
                                <button class="ratio-btn" data-ratio="16:9">16:9</button>
                                <div class="custom-ratio">
                                    <input type="number" id="ratioWidth" min="1" placeholder="宽" class="ratio-input">
                                    <span>:</span>
                                    <input type="number" id="ratioHeight" min="1" placeholder="高" class="ratio-input">
                                </div>
                            </div>
                        </div>

                        <div class="export-control">
                            <label>导出格式</label>
                            <div class="format-buttons">
                                <button class="format-btn active" data-format="jpeg">JPG</button>
                                <button class="format-btn" data-format="png">PNG</button>
                                <button class="format-btn" data-format="webp">WebP</button>
                            </div>
                        </div>
                    </div>

                    <button id="cropBtn" class="crop-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19z"/>
                        </svg>
                        裁剪并下载
                    </button>
                </div>

                <div class="crop-area">
                    <img id="cropImage" src="" alt="待裁剪图片">
                </div>
                
                <!-- 预览区域 -->
                <div class="preview-box preview-bottom">
                    <label>预览效果</label>
                    <div class="preview-container">
                        <div class="preview-item">
                            <span class="preview-title">1:1</span>
                            <div class="preview-frame square">
                                <div class="preview-image"></div>
                            </div>
                        </div>
                        <div class="preview-item">
                            <span class="preview-title">4:3</span>
                            <div class="preview-frame landscape">
                                <div class="preview-image"></div>
                            </div>
                        </div>
                        <div class="preview-item">
                            <span class="preview-title">16:9</span>
                            <div class="preview-frame widescreen">
                                <div class="preview-image"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加加载提示
        cropSection.innerHTML += `
            <div class="loading-hint" id="loadingHint">
                <svg class="loading-icon" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                    </path>
                </svg>
                <span>图片加载中...</span>
            </div>
        `;

        // 重新获取DOM元素
        const cropImage = document.getElementById('cropImage');
        const ratioButtons = document.querySelectorAll('.ratio-btn');
        const ratioWidth = document.getElementById('ratioWidth');
        const ratioHeight = document.getElementById('ratioHeight');
        const formatButtons = document.querySelectorAll('.format-btn');
        const cropBtn = document.getElementById('cropBtn');

        // 重新绑定事件
        bindEvents(ratioButtons, ratioWidth, ratioHeight, formatButtons, cropBtn);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // 移除加载提示
                document.getElementById('loadingHint')?.remove();
                
                cropImage.src = e.target.result;
                cropSection.style.display = 'block';
                uploadArea.style.display = 'none';

                // 等待图片加载完成后初始化裁剪器
                cropImage.onload = () => {
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
                        }
                    });
                };
            } catch (error) {
                handleError(error);
            }
        };
        reader.onerror = (error) => handleError(error);
        reader.readAsDataURL(file);
    } catch (error) {
        handleError(error);
    }
}

// 添加事件绑定函数
function bindEvents(ratioButtons, ratioWidth, ratioHeight, formatButtons, cropBtn) {
    // 裁剪比例按钮事件
    ratioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
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
    ratioWidth.addEventListener('input', debounceCustomRatio);
    ratioHeight.addEventListener('input', debounceCustomRatio);
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
    
    // 获取裁剪预览
    const previewCanvas = cropper.getCroppedCanvas();
    
    // 创建预览对话框
    const dialog = document.createElement('div');
    dialog.className = 'preview-dialog';
    dialog.innerHTML = `
        <div class="preview-content">
            <h3>预览效果</h3>
            <div class="preview-image-container">
                <img src="${previewCanvas.toDataURL()}" alt="预览图片">
            </div>
            <div class="preview-actions">
                <button class="cancel-btn">取消</button>
                <button class="confirm-btn">确认下载</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 绑定按钮事件
    dialog.querySelector('.cancel-btn').onclick = () => dialog.remove();
    dialog.querySelector('.confirm-btn').onclick = () => {
        // 原有的下载代码...
        dialog.remove();
    };
}); 