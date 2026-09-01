(function(){
  
  const term = document.getElementById('term');
  const input = document.getElementById('cmd');
  const chipBox = document.getElementById('chips');
 
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the glitch bit
  const page = document.getElementById('page');
  const field = document.getElementById('field');
  const tears = document.getElementById('tears');
  const countEl = document.getElementById('count');
  const turb = document.querySelector('#gl feTurbulence');
  const disp = document.querySelector('#gl feDisplacementMap');
  let count = 0, busy = false;

  function rand(a,b){ return a + Math.random()*(b-a); }

 
  function spawnTears(y){
    const n = reduce ? 2 : 9;
    for(let i=0;i<n;i++){
      
      const t = document.createElement('div');
      t.className = 'tear';
      const h = rand(3,26);
      const top = y == null ? rand(0,window.innerHeight) : Math.max(0, y + rand(-260,260));
      t.style.height = h + 'px';
      t.style.top = top + 'px';
      t.style.transform = 'translateX(' + rand(-70,70).toFixed(0) + 'px)';
      t.style.background = Math.random() > .5
        ? 'linear-gradient(90deg,transparent,rgba(53,214,240,.55),rgba(255,194,75,.4),transparent)'
        : 'linear-gradient(90deg,rgba(255,194,75,.45),transparent,rgba(53,214,240,.5))';
      t.style.animationDelay = (i * 12) + 'ms';
      tears.appendChild(t);
      
      setTimeout(()=>t.remove(), 520 + i*12);
    }
  }

 
  function glitch(y){
    count++; countEl.textContent = count;
    spawnTears(y);
    document.body.classList.add('glitching');
    setTimeout(()=>document.body.classList.remove('glitching'), 320);

    // shove the grid sideways so the background reacts too
    field.style.backgroundPosition = rand(-14,14).toFixed(0)+'px '+rand(-14,14).toFixed(0)+'px';
    setTimeout(()=>{ field.style.backgroundPosition = '0 0'; }, 260);

    
    if(reduce || busy) return;
    busy = true;
    page.style.filter = 'url(#gl)';
    
    const t0 = performance.now(), dur = 380;
    
    (function frame(now){
      
      const p = Math.min(1, (now - t0) / dur);
      
      const decay = Math.pow(1 - p, 2);
      turb.setAttribute('baseFrequency', (0.0002 + Math.random()*0.02*decay).toFixed(5) + ' ' + (0.3 + Math.random()*0.5).toFixed(3));
      disp.setAttribute('scale', (34 * decay).toFixed(1));
      if(p < 1) requestAnimationFrame(frame);
      else { page.style.filter = 'none'; disp.setAttribute('scale','0'); busy = false; }
    })(t0);
  }

  // clicks on the background, or anywhere that isn't a link/button
  field.addEventListener('pointerdown', e => glitch(e.clientY));
  page.addEventListener('pointerdown', e => {
    if(e.target.closest('a,button,input,textarea,select,#term,table')) return;
    glitch(e.clientY);
  });


  function line(html, cls){
    const d = document.createElement('div');
    d.className = 'ln ' + (cls||'');
    d.innerHTML = html;
    term.appendChild(d);
    
    term.scrollTop = term.scrollHeight;
  }
  function kv(k,v){ line('<span class="kv"><b>'+k+'</b><span>'+v+'</span></span>'); }
  function blank(){ line('&nbsp;'); }
  function go(sel){
    const el = document.querySelector(sel);
    if(el) setTimeout(()=>el.scrollIntoView({behavior: reduce?'auto':'smooth', block:'start'}), 300);
  }


  const commands = {
    help(){
      line('Available:', 'mu');
      kv('whoami','the short version');
      kv('log','what I\'ve learned, in order');
      kv('builds','things I\'ve made');
      kv('stack','what I know and how well');
      kv('learning','what I\'m in the middle of');
      kv('contact','how to reach me');
      kv('glitch','break the page on purpose');
      kv('paper','flip to the printable version');
      kv('clear','wipe the screen');
    },
    whoami(){
      kv('name','Md Jarif Monsur');
      kv('status','First-year Computer Science, UNSW');
      kv('coding since','February 2026');
      kv('into','AI engineering · full-stack · cloud');
      kv('doing','CS50x + CS50P, on top of uni');
      kv('after','<span class="cy">an internship, or any real project</span>');
      blank();
      line('Not much here yet. All of it is mine though.');
    },
    log(){
      line('<span class="sg">Feb 2026</span>  started CS at UNSW');
      line('<span class="sg">Aug 2026</span>  built CultureGuessr in 24h at SYNCS Hack');
      line('<span class="sg">Now</span>       CS50x, CS50P, and this site');
      go('#log');
    },
    builds(){
      line('CultureGuessr  <span class="mu">real-time multiplayer culture guessing game</span>');
      line('               <span class="cy">cultureguessr.onrender.com</span>');
      blank();
      line('That\'s it so far. One thing, finished, online.', 'mu');
      go('#builds');
    },
    stack(){
      line('C · git             <span class="mu">comfortable</span>');
      line('Python · HTML/CSS   <span class="mu">getting there</span>');
      line('FastAPI · JavaScript<span class="mu"> just started</span>');
      go('#stack');
    },
    learning(){
      line('Right now: CS50x and CS50P, both going at once, plus first year.');
      line('Want to end up in AI engineering, full-stack or cloud. Trying all three.', 'mu');
    },
    contact(){
      kv('email','<span class="cy">zarifxmonsur@gmail.com</span>');
      kv('github','github.com/jarifxmonsur');
      kv('reply','usually pretty quick');
    },
    glitch(){
      line('Corrupting…', 'sg');
      glitch(null);
      setTimeout(()=>glitch(null), 160);
    },
    paper(){
      document.getElementById('flip').click();
      line('Switched. Print this page for a clean one-page résumé.', 'sg');
    },
    clear(){ term.innerHTML = ''; }
  };

  ['whoami','log','builds','stack','learning','glitch','contact'].forEach(c=>{
    const b = document.createElement('button');
    b.className='chip'; b.type='button'; b.textContent=c;
    b.addEventListener('click', ()=>{ input.value=c; run(c); input.focus(); });
    chipBox.appendChild(b);
  });

  let hist = [], hIdx = -1;
  function run(raw){
    const cmd = raw.trim().toLowerCase();
    line('<span class="cy">jarif@sydney:~$</span> ' + raw.replace(/</g,'&lt;'));
    if(!cmd){ input.value=''; return; }
    if(commands[cmd]) commands[cmd]();
    else line(cmd.split(' ')[0] + ': command not found. Try <span class="sg">help</span>.', 'mu');
    if(cmd !== 'clear') blank();
    input.value=''; hist.unshift(raw); hIdx=-1;
  }
  
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter') run(input.value);
    
    else if(e.key==='ArrowUp'){ e.preventDefault(); if(hIdx<hist.length-1){ hIdx++; input.value=hist[hIdx]; } }
    else if(e.key==='ArrowDown'){ e.preventDefault(); if(hIdx>0){ hIdx--; input.value=hist[hIdx]; } else { hIdx=-1; input.value=''; } }
  });

  // intro text on load
  const boot = [
    ['<span class="mu">about.sh — loading…</span>', 200],
    ['<span class="mu">→ 1 project · 1 semester · 0 internships so far</span>', 340],
    ['<span class="cy">jarif@sydney:~$</span> whoami', 460],
    ['__WHOAMI__', 240],
    ['<span class="mu">Type <span class="sg">help</span>, tap a command, or click the background.</span>', 200]
  ];
  if(reduce){
    boot.forEach(b => b[0]==='__WHOAMI__' ? commands.whoami() : line(b[0]));
    blank();
  } else {
    let t = 0;
    boot.forEach(b=>{
      t += b[1];
      setTimeout(()=>{ if(b[0]==='__WHOAMI__'){ commands.whoami(); blank(); } else line(b[0]); }, t);
    });
  }

  // light/dark
  const flip = document.getElementById('flip');
  flip.addEventListener('click', ()=>{
    
    const on = document.body.classList.toggle('paper');
    flip.textContent = on ? 'blueprint view' : 'paper view';
  });

  setTimeout(()=>{ if(window.scrollY===0) input.focus({preventScroll:true}); }, 1800);
})();