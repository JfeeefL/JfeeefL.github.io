const b = document.querySelectorAll('button');
for(var i = 0; i < b.length; i ++) {
    b[i].addEventListener('click', echo);
}

function echo() {
    var p = document.createElement('button');
    p.textContent = 'Click Me!';
    document.body.appendChild(p);
    p.addEventListener('click', echo);
}