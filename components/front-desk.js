//const store = require('../stores/store.js');

let backLink = document.createElement('a');
backLink.href = "./";
backLink.id = 'back';
backLink.innerText = "Go back to homepage";
backLink.addEventListener('click', (event) => {
    console.log("Navigating to Homepage");
    window.location.href = '/';

});

document.body.appendChild(backLink);


// add drivers and car for new race
const inputForm = document.createElement("form");
inputForm.id = 'inputContainer';
const inputField = document.createElement("input")
inputField.type = 'text';
inputField.placeholder = 'Enter your text here';
const inputLabel = document.createElement('label');
inputLabel.innerText = 'Driver name:';
inputLabel.htmlFor = 'userInput';
inputField.id = 'userInput';



const buttonConfirmInput = document.createElement('button');
buttonConfirmInput.id = 'confirmButton';
buttonConfirmInput.innerText = 'Add driver';
buttonConfirmInput.type = 'submit';

inputForm.appendChild(inputLabel);
inputForm.appendChild(inputField);
document.body.appendChild(inputForm);
document.body.appendChild(buttonConfirmInput);

let raceDriversMap = new Map();
let clickCounter = 0;

buttonConfirmInput.addEventListener("click", () => {
    const driverName = inputField.value;
    if (driverName === "") {
        console.log("Please enter driver name")
    } else {
        clickCounter ++;
        console.log('Button clicked!');
        //console.log(driverName);
        //raceDriversMap.set(driverName, { car: clickCounter });
        raceDriversMap.set(driverName, clickCounter);
        inputField.value = "";
        store.set('raceDriversMap', Array.from(raceDriversMap.entries()));
    }
    console.log(raceDriversMap);
});



// send data to store so race-control can get it
