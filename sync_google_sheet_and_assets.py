"""
Script Dong bo Google Sheet & Thu vien anh Present vao WorkLife App
Chay file nay de cap nhat danh muc du an va anh tu o dia D:\\Working vao thu muc public/assets
"""

import os
import sys
import json
import urllib.request
import pandas as pd
from PIL import Image

GOOGLE_DRIVE_PATH = r"H:\My Drive\Worklife_NVT\Worklife_Sync.xlsx"
SHEET_URL = "https://docs.google.com/spreadsheets/d/1Nhk9Ai2b9tlAGwmznYmqQ_siVDmf7AIqXfBvXJ0X4Z0/export?format=xlsx"
TEMP_EXCEL = "temp_sheet_download.xlsx"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_ASSETS_DIR = os.path.join(BASE_DIR, "public", "assets")

def compress_image(src_path, dest_path, max_width=1600, quality=82):
    """Nen anh chat luong cao phu hop xem tren iPad/Phone/Web"""
    try:
        with Image.open(src_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            w, h = img.size
            if w > max_width:
                new_w = max_width
                new_h = int((max_width / w) * h)
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            img.save(dest_path, 'JPEG', quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"  [!] Loi khi nen anh {src_path}: {e}")
        return False

def sync():
    print("==========================================================")
    print("🚀 BẮT ĐẦU ĐỒNG BỘ GOOGLE SHEET & ẢNH PHỐI CẢNH PRESENT")
    print("==========================================================")
    
    excel_file_to_read = None

    # 1. Kiem tra file trong H:\My Drive\Worklife_NVT truoc
    if os.path.exists(GOOGLE_DRIVE_PATH):
        print(f"\n[1/3] Phát hiện file Google Drive cục bộ: {GOOGLE_DRIVE_PATH}")
        excel_file_to_read = GOOGLE_DRIVE_PATH
    else:
        print("\n[1/3] Đang tải dữ liệu mới nhất từ link Google Sheets...")
        try:
            urllib.request.urlretrieve(SHEET_URL, TEMP_EXCEL)
            excel_file_to_read = TEMP_EXCEL
            print(" -> Tải file Excel thành công!")
        except Exception as e:
            print(f" -> [Lỗi] Không thể tải Google Sheet: {e}")
            return

    # 2. Đọc các Tab trong Sheet
    print("\n[2/3] Đang phân tích danh mục dự án...")
    try:
        excel_data = pd.read_excel(excel_file_to_read, sheet_name=None)
    except Exception as e:
        print(f" -> [Lỗi khi đọc file Excel]: {e}")
        return
    
    all_projects = []
    if 'All Projects' in excel_data:
        df = excel_data['All Projects'].where(pd.notnull(excel_data['All Projects']), "")
        all_projects = df.to_dict(orient='records')
    elif 'all_projects' in excel_data:
        df = excel_data['all_projects'].where(pd.notnull(excel_data['all_projects']), "")
        all_projects = df.to_dict(orient='records')

    print(f" -> Tìm thấy tổng cộng {len(all_projects)} dự án trong All Projects.")

    # 3. Quét ảnh Present và Thumbnail trên ổ cứng D:
    print("\n[3/3] Đang quét và đồng bộ ảnh phối cảnh (Present/)...")
    synced_projects_count = 0
    total_images_count = 0

    for p in all_projects:
        pid = str(p.get('ID', '')).strip()
        name = str(p.get('Tên Dự Án', p.get('Ten Du An', ''))).strip()
        path = str(p.get('Path', '')).strip()

        if not pid or not path:
            continue

        target_dir = os.path.join(PUBLIC_ASSETS_DIR, pid)
        present_target_dir = os.path.join(target_dir, "Present")
        os.makedirs(present_target_dir, exist_ok=True)

        # Quét Thumbnail
        thumb_copied = False
        if os.path.exists(path):
            for t_name in ['Thumb.jpg', 'thumb.jpg', 'Thumb.png', 'thumb.png', 'cover.jpg']:
                t_file = os.path.join(path, t_name)
                if os.path.exists(t_file):
                    compress_image(t_file, os.path.join(target_dir, "thumb.jpg"), max_width=800)
                    thumb_copied = True
                    break

            # Quét thư mục Present/
            present_src = os.path.join(path, "Present")
            if os.path.exists(present_src):
                local_imgs = [f for f in os.listdir(present_src) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
                if local_imgs:
                    local_imgs.sort()
                    synced_images = []
                    for img_name in local_imgs:
                        src_img = os.path.join(present_src, img_name)
                        dest_img = os.path.join(present_target_dir, img_name)
                        if not os.path.exists(dest_img):
                            compress_image(src_img, dest_img, max_width=1600)
                        synced_images.append(img_name)
                        total_images_count += 1

                    # Ghi manifest.json
                    manifest_file = os.path.join(present_target_dir, "manifest.json")
                    with open(manifest_file, 'w', encoding='utf-8') as mf:
                        json.dump(synced_images, mf, ensure_ascii=False, indent=2)

                    print(f"  [✓] [{pid}] {name}: Đã đồng bộ {len(synced_images)} ảnh Present.")
                    synced_projects_count += 1
                else:
                    print(f"  [-] [{pid}] {name}: Thư mục Present/ trống.")
            else:
                print(f"  [-] [{pid}] {name}: Chưa có thư mục Present/.")
        else:
            print(f"  [!] [{pid}] {name}: Không tìm thấy đường dẫn {path}")

    # Dọn dẹp file tạm nếu có
    if excel_file_to_read == TEMP_EXCEL and os.path.exists(TEMP_EXCEL):
        os.remove(TEMP_EXCEL)

    print("\n==========================================================")
    print(f"🎉 HOÀN TẤT ĐỒNG BỘ: {synced_projects_count} dự án, {total_images_count} ảnh Present.")
    print("==========================================================")

if __name__ == '__main__':
    sync()
