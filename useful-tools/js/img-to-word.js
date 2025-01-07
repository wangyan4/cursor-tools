document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const imageList = document.getElementById('imageList');
    const convertBtn = document.getElementById('convertBtn');
    
    // 处理文件拖放
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary-color)';
        uploadBox.style.backgroundColor = 'rgba(0,113,227,0.05)';
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#e5e5e5';
        uploadBox.style.backgroundColor = 'transparent';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#e5e5e5';
        uploadBox.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // 处理文件选择
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 处理文件函数
    function handleFiles(files) {
        if (files.length === 0) return;
        
        previewSection.style.display = 'block';
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = createImagePreview(e.target.result, file.name);
                imageList.appendChild(imageItem);
            };
            reader.readAsDataURL(file);
        });
    }

    // 创建图片预览元素
    function createImagePreview(src, name) {
        const div = document.createElement('div');
        div.className = 'image-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = name;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            div.remove();
            if (imageList.children.length === 0) {
                previewSection.style.display = 'none';
            }
        };
        
        div.appendChild(img);
        div.appendChild(removeBtn);
        return div;
    }

    // 转换按钮点击事件
    convertBtn.addEventListener('click', async () => {
        if (imageList.children.length === 0) return;
        
        convertBtn.disabled = true;
        convertBtn.innerHTML = '处理中...';
        
        try {
            // 这里添加实际的转换逻辑
            await simulateConversion();
            
            // 转换完成后下载
            downloadWord();
        } catch (error) {
            alert('转换失败，请重试');
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '开始转换';
        }
    });

    // 模拟转换过程
    function simulateConversion() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 下载Word文档
    function downloadWord() {
        // 这里添加实际的下载逻辑
        alert('转换完成！在实际应用中，这里会触发Word文档下载。');
    }
}); 