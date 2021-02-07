let words = ['你吼那么大声干什么？','对对对，你说得对，懂得都懂','针不戳、针不戳','我说你有病是不是？'];
let text = document.querySelector('.inputtext');
let submit = document.querySelector('.inputsubmit');
let feedback = document.querySelector('#psycho');
submit.addEventListener('click',submittext);

function submittext() {
    text.value = '';
    feedback.textContent = '人工智能：' + words[Math.floor(words.length * Math.random())];
}