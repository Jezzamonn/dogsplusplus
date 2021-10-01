function init(): void {
    const elem = document.createElement('div');
    elem.innerText = 'hoi'
    document.body.append(elem);
}

window.onload = init;
