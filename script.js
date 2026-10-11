let tasks = JSON.parse(localStorage.getItem('myStreaks')) || [];

function saveData() {
    localStorage.setItem('myStreaks', JSON.stringify(tasks));
}

// 1. BỘ NÃO XỬ LÝ THỜI GIAN THỰC
function checkRealTimeDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Lấy mốc 0h00 của ngày hôm nay

    let dataChanged = false;

    tasks.forEach(task => {
        // Nếu nhiệm vụ này đã từng được điểm danh ít nhất 1 lần
        if (task.lastCheckInDate) {
            const lastDate = new Date(task.lastCheckInDate);
            lastDate.setHours(0, 0, 0, 0);

            // Tính khoảng cách giữa 2 ngày (đổi từ mili-giây sang ngày)
            const diffTime = today - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Đã sang ngày hôm sau -> Nguội lửa để sẵn sàng điểm danh tiếp
                if (task.isCheckedInToday) {
                    task.isCheckedInToday = false;
                    dataChanged = true;
                }
            } else if (diffDays >= 2) {
                // Cách 2 ngày trở lên -> Xóa chuỗi về 0
                if (task.streak > 0 || task.isCheckedInToday) {
                    task.streak = 0;
                    task.isCheckedInToday = false;
                    dataChanged = true;
                }
            }
        }
    });

    if (dataChanged) {
        saveData();
    }
}

// 2. HÀM CHÈN EMOJI VÀO Ô NHẬP LIỆU
function addEmoji(emoji) {
    const input = document.getElementById('newTaskInput');
    input.value += emoji;
    input.focus(); // Đưa con trỏ nhấp nháy lại vào ô nhập
}

// 3. VẼ DANH SÁCH NHIỆM VỤ
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ""; 
    
    tasks.forEach((task, index) => {
        const flameClass = task.isCheckedInToday ? "colored" : "grayscale";
        const btnDisabled = task.isCheckedInToday ? "disabled" : "";
        const btnText = task.isCheckedInToday ? "Đã xong" : "✅ Điểm danh";

        const taskHTML = `
            <div class="task-card">
                <div class="task-info">
                    <h3 class="task-name">${task.name}</h3>
                    <button class="delete-btn" onclick="deleteTask(${index})">🗑 Xóa</button>
                </div>
                
                <div class="streak-info">
                    <svg class="flame ${flameClass}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.25,22C5.06,22,2,17.24,2,12.5C2,8.5,5.25,4.75,7,3c0.16-0.16,0.42-0.19,0.61-0.06C7.81,3.06,7.91,3.31,7.85,3.52C7.38,5.17,7.74,7.03,8.75,8.44c1.17,1.64,2.99,2.4,4.28,1.44c1.07-0.79,1.38-2.31,0.85-4.14c-0.29-1.02-0.15-2.12,0.41-3.01c0.55-0.89,1.49-1.46,2.54-1.57c0.23-0.02,0.44,0.11,0.52,0.33c0.07,0.22,0.01,0.47-0.16,0.62C15.86,3.36,15.5,5.19,16,6.97c0.41,1.47,1.37,2.69,2.68,3.41c1.54,0.84,2.78,2.37,3.13,3.87C22.3,16.27,20,22,11.25,22z"/>
                    </svg>
                    <span class="streak-count">${task.streak}</span>
                </div>

                <button ${btnDisabled} onclick="checkIn(${index})">${btnText}</button>
            </div>
        `;
        taskList.innerHTML += taskHTML;
    });
}

// 4. CÁC HÀM TƯƠNG TÁC (Thêm, Xóa, Điểm danh)
function addTask() {
    const input = document.getElementById('newTaskInput');
    const taskName = input.value.trim();

    if (taskName !== "") {
        tasks.push({
            name: taskName,
            streak: 0,
            isCheckedInToday: false,
            lastCheckInDate: null // Nhiệm vụ mới chưa có ngày điểm danh
        });
        input.value = ""; 
        saveData();       
        renderTasks();    
    }
}

function deleteTask(index) {
    if (confirm("Bạn có chắc muốn xóa nhiệm vụ này không?")) {
        tasks.splice(index, 1); 
        saveData();
        renderTasks();
    }
}

function checkIn(index) {
    if (!tasks[index].isCheckedInToday) {
        tasks[index].streak++;
        tasks[index].isCheckedInToday = true;
        // Bắt buộc: Lưu lại chính xác thời gian điểm danh của lúc này
        tasks[index].lastCheckInDate = new Date().toISOString(); 
        saveData();
        renderTasks();
    }
}

// CHUỖI KHỞI ĐỘNG KHI MỞ ỨNG DỤNG:
// 1. Đọc đồng hồ máy tính, kiểm tra xem có cần dập lửa hoặc phạt reset chuỗi không
checkRealTimeDates();
// 2. Vẽ giao diện ra màn hình sau khi đã tính toán xong
renderTasks();