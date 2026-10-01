# Gia Phả Vũ Tộc

Website gia phả với cây phả hệ tương tác, hỗ trợ kéo thả, di chuyển khung nhìn, chỉnh sửa thông tin thành viên và xuất/nhập dữ liệu JSON.

Project này được xây dựng bằng HTML, CSS và JavaScript thuần, không cần bước build, phù hợp để deploy trực tiếp lên GitHub Pages.

## Tính năng chính

### Giao diện
- Thiết kế mới tông giấy dó ấm, có chế độ tối/sáng (phím `T`), responsive tới điện thoại (bảng chi tiết dạng bottom sheet)
- Thẻ thành viên có avatar (ảnh hoặc chữ cái đầu), viền màu theo giới tính, nhãn đời, trạng thái "Đã mất"
- Đường nối dạng khuỷu mềm, nhãn đời (I, II, III…) bên lề, minimap góc phải
- Bật **Dòng dõi** để làm nổi tổ tiên và hậu duệ của người đang chọn, kèm breadcrumb từ thủy tổ

### 4 chế độ xem
- **Cây phả hệ**: kéo thả thành viên (giữ `Shift` để kéo cả nhánh), kéo nền, cuộn để zoom, thu gọn/mở rộng nhánh, tự sắp xếp có animation
- **Danh sách**: bảng tất cả thành viên, sắp xếp theo từng cột
- **Thống kê**: số thành viên theo đời/nhánh, tỷ lệ nam nữ, tuổi thọ trung bình, đông con nhất, sống thọ nhất
- **Dòng thời gian**: năm sinh của các thành viên theo thập kỷ

### Chỉnh sửa
- Ngăn chi tiết: họ tên, giới tính, vai trò, đời, năm sinh–mất, nhánh, vợ/chồng, nghề nghiệp, quê quán, ảnh đại diện, ghi chú
- Thêm con, thêm anh em, xóa nhánh (có nút hoàn tác ngay trên thông báo)
- Hoàn tác/làm lại tới 100 bước, menu chuột phải trên thẻ
- Bộ lọc theo giới tính, đời, nhánh; tìm nhanh bằng `Ctrl K`

### Dữ liệu
- Lưu tự động trong `localStorage`
- Xuất/nhập JSON, xuất ảnh PNG của cả cây
- Kiểm tra dữ liệu nhập vào để chặn ID trùng, `parentId` không tồn tại và quan hệ vòng

### Phím tắt

| Phím | Chức năng |
|---|---|
| `Ctrl K` | Tìm thành viên |
| `Ctrl Z` / `Ctrl Y` | Hoàn tác / Làm lại |
| `N` / `S` | Thêm con / Thêm anh em |
| `Delete` | Xóa nhánh đang chọn |
| `C` | Thu gọn / mở nhánh |
| `L` | Sắp xếp lại cây |
| `F` | Vừa khung nhìn |
| `+` / `-` | Phóng to / thu nhỏ |
| `T` | Đổi giao diện sáng/tối |
| `?` | Xem bảng phím tắt |

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

## Dữ liệu được lưu như thế nào

Project hiện tại lưu dữ liệu theo 2 cách:

### 1. Lưu tự động trong trình duyệt

Dữ liệu được lưu trong:

```text
localStorage
```

Các khóa đang sử dụng:

```text
giapha-editor-state-v2   # dữ liệu cây
giapha-theme             # giao diện sáng/tối
giapha-prefs             # chế độ xem, trạng thái sidebar, dòng dõi
```

Điều này có nghĩa là:

- Dữ liệu chỉ tồn tại trên trình duyệt và thiết bị đang dùng
- Nếu xóa dữ liệu trình duyệt thì sẽ mất
- Người khác truy cập cùng website sẽ không tự thấy dữ liệu bạn đã sửa

### 2. Lưu thủ công bằng file JSON

Đây là cách phù hợp để sao lưu hoặc chuyển dữ liệu giữa các máy:

1. Mở menu `⋯` → `Xuất JSON`
2. Giữ file JSON lại
3. Khi cần, dùng `Nhập JSON` để nạp lại

## Dữ liệu mẫu nằm ở đâu

Dữ liệu gia phả mặc định nằm trong file:

- `script.js`

Cụ thể là biến:

```js
function createDefaultState() { ... }
```

Nếu muốn đổi cây mặc định khi người dùng mở trang lần đầu, hãy sửa dữ liệu trong `createDefaultState()`.

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

- `computeLayout()` để tính bố cục cây tự động
- `renderScene()` / `createCard()` để render thẻ thành viên
- `renderLinks()` để vẽ đường nối
- `addChild()` / `addSibling()` / `deleteBranch()` để sửa cây
- `mutate()` / `undo()` / `redo()` cho lịch sử thao tác
- `renderList()` / `renderStats()` / `renderTimeline()` cho các chế độ xem khác
- `persistNow()` để lưu dữ liệu

## Gợi ý phát triển tiếp

- In / xuất PDF
- Đồng bộ dữ liệu lên cloud thay vì chỉ lưu cục bộ

## Giấy phép

Hiện chưa khai báo license. Nếu bạn muốn public repository, nên bổ sung một license phù hợp như MIT.
