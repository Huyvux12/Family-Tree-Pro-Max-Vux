# Gia Phả Vũ Tộc

Website gia phả với cây phả hệ tương tác, hỗ trợ kéo thả, di chuyển khung nhìn, chỉnh sửa thông tin thành viên và xuất/nhập dữ liệu JSON.

Project này được xây dựng bằng HTML, CSS và JavaScript thuần, không cần bước build, phù hợp để deploy trực tiếp lên GitHub Pages.

## Tính năng chính

- Hiển thị cây gia phả theo dạng node liên kết cha - con
- Kéo thả từng thành viên để sắp xếp lại bố cục
- Kéo nền để di chuyển khung nhìn, dùng nút hoặc con lăn để thu phóng
- Chỉnh sửa thông tin thành viên ngay trên giao diện
- Thêm con, thêm anh em cùng thế hệ, xóa cả nhánh
- Lưu tự động trong `localStorage`
- Xuất và nhập dữ liệu bằng file JSON

## Cấu trúc project

```text
giapha/
├─ index.html   # Giao diện chính
├─ styles.css   # Toàn bộ phần trình bày
└─ script.js    # Dữ liệu mẫu, render cây và logic tương tác
```

## Chạy local

Vì đây là site tĩnh, bạn có thể chạy theo một trong hai cách:

### Cách 1: Mở trực tiếp

Mở file `index.html` bằng trình duyệt.

### Cách 2: Chạy bằng server tĩnh

Khuyến nghị dùng server tĩnh để tránh một số hạn chế của `file://` khi test.

Ví dụ với Node.js:

```bash
npx serve .
```

Hoặc với Python:

```bash
python -m http.server 8000
```

Sau đó mở trình duyệt tại địa chỉ tương ứng, ví dụ:

```text
http://localhost:8000
```

## Cách sử dụng

### 1. Di chuyển và thu phóng

- Kéo nền để di chuyển khung nhìn
- Dùng con lăn chuột để phóng to/thu nhỏ
- Hoặc dùng nút `+` / `-`
- Nút `Căn giữa cây` sẽ đưa cây về vùng nhìn hợp lý

### 2. Chọn và chỉnh sửa thành viên

- Bấm vào một node bất kỳ trong cây
- Bảng bên phải sẽ hiện thông tin của thành viên đang chọn
- Cập nhật các trường như:
  - Họ tên
  - Chức danh / vai trò
  - Thế hệ
  - Năm tháng
  - Nhánh / chi
  - Ghi chú

### 3. Thêm và xóa nhánh

- `Thêm con`: tạo node con trực tiếp
- `Thêm anh em`: tạo node cùng cấp với thành viên đang chọn
- `Xóa nhánh`: xóa thành viên đang chọn và toàn bộ hậu duệ phía dưới

### 4. Xuất / nhập dữ liệu

- `Xuất JSON`: tải toàn bộ dữ liệu cây hiện tại về máy
- `Nhập JSON`: nạp lại dữ liệu từ file JSON đã xuất trước đó

## Dữ liệu được lưu như thế nào

Project hiện tại lưu dữ liệu theo 2 cách:

### 1. Lưu tự động trong trình duyệt

Dữ liệu được lưu trong:

```text
localStorage
```

Khóa đang sử dụng:

```text
giapha-editor-state-v2
```

Điều này có nghĩa là:

- Dữ liệu chỉ tồn tại trên trình duyệt và thiết bị đang dùng
- Nếu xóa dữ liệu trình duyệt thì sẽ mất
- Người khác truy cập cùng website sẽ không tự thấy dữ liệu bạn đã sửa

### 2. Lưu thủ công bằng file JSON

Đây là cách phù hợp để sao lưu hoặc chuyển dữ liệu giữa các máy:

1. Bấm `Xuất JSON`
2. Giữ file JSON lại
3. Khi cần, dùng `Nhập JSON` để nạp lại

## Dữ liệu mẫu nằm ở đâu

Dữ liệu gia phả mặc định nằm trong file:

- `script.js`

Cụ thể là biến:

```js
const defaultState = { ... }
```

Nếu muốn đổi cây mặc định khi người dùng mở trang lần đầu, hãy sửa dữ liệu trong `defaultState`.

## Deploy lên GitHub Pages

Vì project không có bước build, việc deploy rất đơn giản.

### Cách làm cơ bản

1. Push project lên GitHub
2. Vào `Settings`
3. Chọn `Pages`
4. Ở mục source, chọn branch muốn publish, ví dụ:

```text
main / root
```

5. Lưu lại và đợi GitHub Pages xuất bản

Sau khi deploy, trang sẽ chạy trực tiếp từ:

```text
https://<username>.github.io/<repo>
```

## Lưu ý khi dùng trên GitHub Pages

GitHub Pages chỉ host file tĩnh, nên:

- Không có database
- Không có backend
- Không có cơ chế lưu chung cho nhiều người dùng

Nếu bạn muốn nhiều người cùng sửa và cùng thấy một bộ dữ liệu chung, cần tích hợp thêm backend hoặc dịch vụ lưu trữ ngoài như:

- Supabase
- Firebase
- API riêng
- GitHub API để ghi file JSON về repo

## Tùy chỉnh giao diện

### Chỉnh phần hiển thị

Sửa trong:

- `index.html`
- `styles.css`

### Chỉnh logic cây

Sửa trong:

- `script.js`

Các phần quan trọng:

- `renderNodes()` để render node
- `renderLinksBetweenNodes()` để vẽ liên kết
- `addChildNode()` để thêm con
- `addSiblingNode()` để thêm anh em
- `deleteBranch()` để xóa nhánh
- `persistState()` để lưu dữ liệu

## Gợi ý phát triển tiếp

- Thêm ảnh đại diện cho từng thành viên
- Thêm trường ngày sinh, ngày mất, quê quán, nghề nghiệp
- Thêm tìm kiếm theo tên
- Thêm lọc theo thế hệ hoặc nhánh
- Thêm chế độ xem toàn màn hình
- Đồng bộ dữ liệu lên cloud thay vì chỉ lưu cục bộ

## Giấy phép

Hiện chưa khai báo license. Nếu bạn muốn public repository, nên bổ sung một license phù hợp như MIT.
