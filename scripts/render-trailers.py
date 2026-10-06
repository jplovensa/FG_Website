"""Optional offline renderer: pip install playwright pillow; install Chromium and ffmpeg.
Start npm run dev, then python scripts/render-trailers.py --url http://localhost:3000/.
No Python, browser automation, or FFmpeg dependency is needed for deployment.
"""
import argparse, base64, pathlib, subprocess, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image
parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:3004/FG_Website/')
parser.add_argument('--samples', action='store_true')
args = parser.parse_args()
assets = pathlib.Path(__file__).resolve().parent.parent / 'assets'
with sync_playwright() as p, tempfile.TemporaryDirectory(prefix='fjall-films-') as temp:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width':1280,'height':720}, reduced_motion='reduce')
    page.goto(args.url)
    page.evaluate('''async () => {
      await document.fonts.ready;
      const {createConstructionScene} = await import('./construction-scene.js');
      const {getTrailerShot} = await import('./trailer-player.js');
      const canvas=document.createElement('canvas'); canvas.style.cssText='position:fixed;inset:0;width:1280px;height:720px;z-index:100000'; document.body.append(canvas);
      const scene=createConstructionScene(canvas,{manual:true,reducedMotion:{matches:false,addEventListener(){}},guideElement:null});
      if(!scene)throw Error('WebGL unavailable');
      const film=document.createElement('canvas');film.width=1280;film.height=720;const ctx=film.getContext('2d');
      const logo=new Image();logo.src='./assets/fjall-logo.png';await logo.decode();
      window.renderFilm=(kind,time)=>{
        const shot=getTrailerShot(kind,time);scene.renderShot(shot);ctx.drawImage(canvas,0,0,1280,720);
        ctx.fillStyle='#07100e';ctx.fillRect(0,0,1280,44);ctx.fillRect(0,676,1280,44);
        ctx.textBaseline='alphabetic';
        if(shot.endCard){
          ctx.fillStyle='rgba(5,18,15,.62)';ctx.fillRect(0,44,1280,632);
          ctx.drawImage(logo,530,220,220,77);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='400 50px Inter';ctx.fillText(shot.title,640,397);ctx.font='400 18px Inter';ctx.fillText(shot.caption,640,443);
        }else{
          const shade=ctx.createLinearGradient(0,400,0,676);shade.addColorStop(0,'rgba(5,18,15,0)');shade.addColorStop(1,'rgba(5,18,15,.85)');ctx.fillStyle=shade;ctx.fillRect(0,400,1280,276);
          ctx.textAlign='left';ctx.fillStyle='#fff';ctx.font='400 16px Inter';ctx.fillText(shot.caption.toUpperCase(),64,564);ctx.font='400 52px Inter';ctx.fillText(shot.title,64,630);
        }
        return film.toDataURL('image/png').split(',')[1];
      };
    }''')
    for kind in ['greenshift','fad']:
        folder=pathlib.Path(temp)/kind;folder.mkdir()
        times=[4,12.5,17] if args.samples else [i/24 for i in range(432)]
        for i,t in enumerate(times):
            data=page.evaluate('([kind,t])=>window.renderFilm(kind,t)',[kind,t])
            frame=folder/f'{i:05d}.png';frame.write_bytes(base64.b64decode(data))
            if args.samples: Image.open(frame).save(f'/tmp/{kind}-{t}.png')
            if not args.samples and i==300: Image.open(frame).save(assets/f'{kind}-trailer-poster.webp',quality=85)
            if i%96==0:print(kind,i,flush=True)
        if not args.samples:
            subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','24','-i',str(folder/'%05d.png'),'-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(assets/f'{kind}-trailer.mp4')],check=True)
            print(kind,'rendered',flush=True)
    browser.close()
