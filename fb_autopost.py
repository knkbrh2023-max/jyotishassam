import os
import time
import math
import wave
import struct
import shutil
import subprocess
import requests
from datetime import datetime, timezone, timedelta
from playwright.sync_api import sync_playwright

# ভাৰতীয় সময় (IST)
ist = timezone(timedelta(hours=5, minutes=30))
now = datetime.now(ist)

assamese_months = ["জানুৱাৰী", "ফেব্ৰুৱাৰী", "মাৰ্চ", "এপ্ৰিল", "মে'", "জুন", "জুলাই", "আগষ্ট", "ছেপ্টেম্বৰ", "অক্টোবৰ", "নৱেম্বৰ", "ডিচেম্বৰ"]
assamese_days = ["সোমবাৰ", "মঙ্গলবাৰ", "বুধবাৰ", "বৃহস্পতিবাৰ", "শুক্ৰবাৰ", "শনিবাৰ", "দেওবাৰ"]

def to_assamese_num(n):
    mapping = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'}
    return ''.join(mapping.get(c, c) for c in str(n))

date_str = f"{to_assamese_num(now.day)} {assamese_months[now.month - 1]} {to_assamese_num(now.year)}"
day_str = assamese_days[now.weekday()]

# ১. সুমধুৰ ভাৰতীয় আধ্যাত্মিক সংগীত (Raga Bhupali Spiritual Melody) তৈয়াৰ কৰা
def generate_pleasant_music(filename="pleasant_bgm.wav", duration=15):
    sample_rate = 44100
    num_samples = duration * sample_rate
    notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63, 293.66]
    note_len = 0.80

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        for i in range(num_samples):
            t = i / sample_rate
            drone = 0.04 * math.sin(2 * math.pi * 130.81 * t) + 0.03 * math.sin(2 * math.pi * 196.00 * t)
            note_idx = int(t / note_len) % len(notes)
            note_t = t % note_len
            freq = notes[note_idx]
            envelope = math.exp(-3.0 * note_t) * (1 - math.exp(-45 * note_t))
            
            melody = envelope * (
                0.22 * math.sin(2 * math.pi * freq * t) +
                0.10 * math.sin(2 * math.pi * (freq * 2) * t) +
                0.04 * math.sin(2 * math.pi * (freq * 3) * t)
            )
            
            fade = 1.0
            if t < 1.2:
                fade = t / 1.2
            elif t > duration - 1.8:
                fade = max(0.0, (duration - t) / 1.8)

            val = (drone + melody) * fade
            sample = max(-32767, min(32767, int(val * 32767)))
            wav_file.writeframesraw(struct.pack('<hh', sample, sample))

    print("🎵 ১. সুমধুৰ আধ্যাত্মিক সংগীত সফলতাৰে তৈয়াৰ হ'ল!")

# ২. মেইন ফটো + ৯:১৬ মোবাইল ৰিলৰ বাবে ৩টা ফুল-স্ক্ৰীণ স্লাইড (1080x1920) তৈয়াৰ কৰা
def generate_images_and_9_16_slides():
    html_path = os.path.abspath("auto_rashifal.html")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # (ক) মেইন ফটো পোষ্টৰ বাবে ১২টা ৰাশিৰ ফটোখন
        page = browser.new_page(viewport={"width": 1000, "height": 1400}, device_scale_factor=2)
        page.goto(f"file://{html_path}", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.locator("#rashifal-sheet").screenshot(path="daily_rashifal.png")
        page.close()

        # (খ) ৯:১৬ মোবাইল ফুল-স্ক্ৰীণ (1080x1920) ৰিলৰ বাবে ৩টা স্লাইড তৈয়াৰ কৰা
        vpage = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        vpage.goto(f"file://{html_path}", wait_until="networkidle")
        vpage.wait_for_timeout(1000)

        vpage.evaluate("""() => {
            const btnBar = document.querySelector('.btn-bar');
            if (btnBar) btnBar.style.display = 'none';
            document.body.style.padding = '0';
            document.body.style.margin = '0';

            const sheet = document.getElementById('rashifal-sheet');
            sheet.style.width = '1080px';
            sheet.style.height = '1920px';
            sheet.style.borderRadius = '0';
            sheet.style.border = '10px solid #d4af37';
            sheet.style.padding = '28px';
            sheet.style.display = 'flex';
            sheet.style.flexDirection = 'column';
            sheet.style.justifyContent = 'space-between';
            sheet.style.boxSizing = 'border-box';

            const topHeader = document.querySelector('.top-header');
            if (topHeader) topHeader.style.padding = '22px 28px';
            const bigTitle = document.querySelector('.big-title');
            if (bigTitle) bigTitle.style.fontSize = '62px';
            const datePill = document.querySelector('.date-pill');
            if (datePill) datePill.style.fontSize = '28px';
            const dayPill = document.querySelector('.day-pill');
            if (dayPill) dayPill.style.fontSize = '26px';
            const logoCircle = document.querySelector('.logo-circle');
            if (logoCircle) { logoCircle.style.width = '130px'; logoCircle.style.height = '130px'; }
            const omCircle = document.querySelector('.om-circle');
            if (omCircle) { omCircle.style.width = '130px'; omCircle.style.height = '130px'; omCircle.style.fontSize = '68px'; }
            const subNote = document.querySelector('.sub-note');
            if (subNote) { subNote.style.fontSize = '22px'; subNote.style.padding = '12px'; }

            const grid = document.getElementById('rashi-container');
            grid.style.gridTemplateColumns = '1fr';
            grid.style.gap = '20px';
            grid.style.flexGrow = '1';
            grid.style.alignContent = 'center';

            document.querySelectorAll('.rashi-card').forEach(c => {
                c.style.borderRadius = '18px';
                c.style.border = '2.5px solid #d4af37';
                const head = c.querySelector('.rashi-head');
                if (head) { head.style.fontSize = '34px'; head.style.padding = '14px 22px'; }
                const icon = c.querySelector('.rashi-icon');
                if (icon) { icon.style.width = '52px'; icon.style.height = '52px'; icon.style.fontSize = '32px'; }
                const body = c.querySelector('.rashi-body');
                if (body) { body.style.fontSize = '25px'; body.style.lineHeight = '1.55'; body.style.padding = '18px 24px'; }
            });

            const footer = document.querySelector('.bottom-footer');
            if (footer) { footer.style.fontSize = '24px'; footer.style.padding = '16px 28px'; }
            const fLogo = document.querySelector('.footer-logo');
            if (fLogo) { fLogo.style.width = '42px'; fLogo.style.height = '42px'; }
        }""")

        # স্লাইড ১: প্ৰথম ৪টা ৰাশি (মেষ - কৰ্কট)
        vpage.evaluate("""() => {
            document.querySelectorAll('.rashi-card').forEach((c, i) => {
                c.style.display = (i >= 0 && i < 4) ? 'flex' : 'none';
            });
        }""")
        vpage.wait_for_timeout(300)
        vpage.screenshot(path="reel_slide1.png")

        # স্লাইড ২: মাজৰ ৪টা ৰাশি (সিংহ - বৃশ্চিক)
        vpage.evaluate("""() => {
            document.querySelectorAll('.rashi-card').forEach((c, i) => {
                c.style.display = (i >= 4 && i < 8) ? 'flex' : 'none';
            });
        }""")
        vpage.wait_for_timeout(300)
        vpage.screenshot(path="reel_slide2.png")

        # স্লাইড ৩: শেষৰ ৪টা ৰাশি (ধনু - মীন)
        vpage.evaluate("""() => {
            document.querySelectorAll('.rashi-card').forEach((c, i) => {
                c.style.display = (i >= 8 && i < 12) ? 'flex' : 'none';
            });
        }""")
        vpage.wait_for_timeout(300)
        vpage.screenshot(path="reel_slide3.png")

        browser.close()
    print("✅ ২. ৯:১৬ মোবাইল ফুল-স্ক্ৰীণৰ ৩টা স্লাইড সফলতাৰে তৈয়াৰ হ'ল!")

# ৩. ৯:১৬ এনিমেটেড মোবাইল ৰিল ভিডিঅ' (1080x1920) তৈয়াৰ কৰা
def generate_animated_9_16_reel():
    if not shutil.which("ffmpeg"):
        print("⚙️ ছাৰ্ভাৰত FFmpeg ইনষ্টল কৰা হৈছে...")
        subprocess.run(["sudo", "apt-get", "update", "-y"], check=True)
        subprocess.run(["sudo", "apt-get", "install", "-y", "ffmpeg"], check=True)

    audio_file = "music.mp3" if os.path.exists("music.mp3") else "pleasant_bgm.wav"
    if audio_file == "pleasant_bgm.wav":
        generate_pleasant_music(audio_file, duration=15)

    filter_complex = (
        "[0:v]scale=1188:2112,zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=140:s=1080x1920:fps=25,settb=1/25,fps=25,format=yuv420p[v0];"
        "[1:v]scale=1188:2112,zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=140:s=1080x1920:fps=25,settb=1/25,fps=25,format=yuv420p[v1];"
        "[2:v]scale=1188:2112,zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=140:s=1080x1920:fps=25,settb=1/25,fps=25,format=yuv420p[v2];"
        "[v0][v1]xfade=transition=slideleft:duration=0.8:offset=4.5[vx];"
        "[vx][v2]xfade=transition=slideleft:duration=0.8:offset=9.2,format=yuv420p[vout]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", "reel_slide1.png",
        "-i", "reel_slide2.png",
        "-i", "reel_slide3.png",
        "-i", audio_file,
        "-filter_complex", filter_complex,
        "-map", "[vout]", "-map", "3:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k",
        "-t", "14.5", "-shortest",
        "daily_reel_9_16.mp4"
    ]
    subprocess.run(cmd, check=True)
    print("🎬 ৩. ৯:১৬ ফুল-স্ক্ৰীণ এনিমেটেড Reel ভিডিঅ' (daily_reel_9_16.mp4) সফলতাৰে তৈয়াৰ হ'ল!")

# ৪. পোষ্টৰ তলত ১ম কমেন্টত ৱেবছাইটৰ লিংক দিয়া (ডাবল ID চেষ্টা)
def add_first_comment(id_list, access_token, wait_sec=4):
    time.sleep(wait_sec)
    comment_text = (
        f"🌐 আমাৰ অফিচিয়েল ৱেবছাইটত বিনামূলীয়াকৈ আপোনাৰ ভৱিষ্যত গণনা কৰক:\n\n"
        f"💍 ১. আপোনাৰ হাতত কোনটো ৰত্ন (পাথৰ) খাপ খাব চাবলৈ ইয়াত টিপক:\n"
        f"👉 https://jyotishassam.com\n\n"
        f"📜 ২. জন্ম তাৰিখ দি সম্পূৰ্ণ অসমীয়া জন্ম কুণ্ডলী (PDF) ডাউনলোড কৰক:\n"
        f"👉 https://jyotishassam.com\n\n"
        f"❤️ ৩. বিবাহৰ বাবে ল'ৰা-ছোৱালীৰ যোটক বিচাৰ (Kundali Matching) কৰক:\n"
        f"👉 https://jyotishassam.com"
    )
    
    for obj_id in id_list:
        if not obj_id:
            continue
        comment_url = f"https://graph.facebook.com/v20.0/{obj_id}/comments"
        res = requests.post(comment_url, data={"message": comment_text, "access_token": access_token})
        if res.status_code == 200:
            print(f"🎉 ১ম কমেন্টত ৱেবছাইটৰ লিংক সফলতাৰে যোগ হ'ল! (ID: {obj_id})")
            return True
        else:
            print(f"⚠️ ID ({obj_id}) ত কমেন্টৰ চেষ্টা:", res.json())
    return False

# ৫. ফেচবুকত ফটো পোষ্ট কৰা
def post_photo_to_facebook(page_id, access_token, caption):
    photo_url = f"https://graph.facebook.com/v20.0/{page_id}/photos"
    with open("daily_rashifal.png", "rb") as img_file:
        response = requests.post(
            photo_url,
            data={"message": caption, "access_token": access_token},
            files={"source": img_file}
        )
    res_data = response.json()
    if response.status_code == 200:
        print("✅ ৪. ফটোখন সফলতাৰে পোষ্ট হ'ল!", res_data)
        # প্ৰথমে photo id ত চেষ্টা কৰিব, নহ'লে post_id ত চেষ্টা কৰিব
        add_first_comment([res_data.get("id"), res_data.get("post_id")], access_token, wait_sec=4)
    else:
        raise Exception(f"❌ ফটো পোষ্টত সমস্যা: {res_data}")

# ৬. ফেচবুকত ৯:১৬ অটো-ৰিল (Facebook Reels) পোষ্ট কৰা
def post_9_16_reel_to_facebook(page_id, access_token, caption):
    print("🚀 ৫. ৯:১৬ এনিমেটেড Facebook Reel আপলোড আৰম্ভ হৈছে...")
    init_url = f"https://graph.facebook.com/v20.0/{page_id}/video_reels"
    init_res = requests.post(init_url, data={
        "upload_phase": "start",
        "access_token": access_token
    }).json()

    if "video_id" in init_res:
        video_id = init_res["video_id"]
        upload_url = init_res["upload_url"]
        file_size = os.path.getsize("daily_reel_9_16.mp4")

        with open("daily_reel_9_16.mp4", "rb") as f:
            headers = {
                "Authorization": f"OAuth {access_token}",
                "offset": "0",
                "file_size": str(file_size)
            }
            requests.post(upload_url, headers=headers, data=f)

        finish_res = requests.post(init_url, data={
            "access_token": access_token,
            "video_id": video_id,
            "upload_phase": "finish",
            "video_state": "PUBLISHED",
            "description": caption
        }).json()

        print("🎉 ৬. ৯:১৬ এনিমেটেড Facebook Reel সফলতাৰে পাব্লিছ হ'ল!", finish_res)
        # ৰিলটো প্রচেছিং হ'বলৈ ১২ ছেকেণ্ড ৰৈ কমেন্ট কৰা
        add_first_comment([video_id, finish_res.get("post_id")], access_token, wait_sec=12)
    else:
        vid_url = f"https://graph.facebook.com/v20.0/{page_id}/videos"
        with open("daily_reel_9_16.mp4", "rb") as vf:
            v_res = requests.post(
                vid_url,
                data={"description": caption, "access_token": access_token},
                files={"source": vf}
            ).json()
        print("✅ ভিডিঅ' সফলতাৰে পোষ্ট হ'ল!", v_res)
        add_first_comment([v_res.get("id")], access_token, wait_sec=8)

if __name__ == "__main__":
    page_id = os.environ.get("FB_PAGE_ID")
    access_token = os.environ.get("FB_ACCESS_TOKEN")

    if not page_id or not access_token:
        raise ValueError("❌ FB_PAGE_ID বা FB_ACCESS_TOKEN পোৱা নগ'ল!")

    # কেপচনটোত সাস্পেন্স + পোনপটীয়া লিংক দুয়োটাই দিয়া হৈছে যাতে মানুহে ক্লিক কৰিব পাৰে
    caption = (
        f"🔮 আজিৰ দৈনিক ৰাশিফল — {date_str} ({day_str}) 🕉️✨\n\n"
        f"⚠️ আজি গ্ৰহৰ স্থান পৰিৱৰ্তনৰ বাবে ৩টা ৰাশিৰ জাতক-জাতিকাই বিশেষ সাৱধান হোৱাটো জৰুৰী!\n\n"
        f"💍 আপোনাৰ জন্ম তাৰিখ অনুসাৰে আঙুলিত কোনটো ৰত্নই (Lucky Gemstone) ভাগ্য সলাব আৰু সম্পূৰ্ণ অসমীয়া জন্ম কুণ্ডলীখন (PDF) বিনামূলীয়াকৈ ডাউনলোড কৰিবলৈ এতিয়াই আমাৰ অফিচিয়েল ৱেবছাইট খোলক:\n"
        f"👉 https://jyotishassam.com\n\n"
        f"💬 আপোনাৰ ৰাশিটো কি? তলত কমেন্টত 'ওঁম নমঃ শিৱায়' লিখি জনাব!\n\n"
        f"#AssameseReels #JyotishAssam #আজিৰৰাশিফল #AssameseRashifal #AssamAstrology #ReelsAssam"
    )

    generate_images_and_9_16_slides()
    generate_animated_9_16_reel()
    post_photo_to_facebook(page_id, access_token, caption)
    post_9_16_reel_to_facebook(page_id, access_token, caption)
