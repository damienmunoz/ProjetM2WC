window.onload = init;

function init() {
    console.log('page chargée');
    
    const clavier1 = document.querySelector('#clavier1');
    clavier1.addEventListener('codeCorrect', (event) => {
        console.log('code correct dans index.html');
        console.log(event.detail.code);
    });

    const btn = document.querySelector('#changeCodebtn');
    btn.addEventListener('click', () => {
        clavier1.changeCode('2345');
        //console.log('code changé');
    });

}