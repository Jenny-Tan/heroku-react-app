import './App.css';
import React from 'react';

// atob is deprecated but this function converts base64string to text string
const decodeFileBase64 = (base64String) => {
  // From Bytestream to Percent-encoding to Original string
  return decodeURIComponent(
    atob(base64String).split("").map(function (c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join("")
  );
};


function App() {
  const [inputFileData, setInputFileData] = React.useState(''); // represented as bytes data (string)
  const [outputFileData, setOutputFileData] = React.useState(''); // represented as readable data (text string)
  const [buttonDisable, setButtonDisable] = React.useState(false);
  const [buttonText, setButtonText] = React.useState('Submit');

  // my modification
  const [initialMoney, setInitialMoney] = React.useState('1000');
  const [timeRange, setTimeRange] = React.useState('year')
  const [company, setCompany] = React.useState('goog')

  // debug use
  const [textBox, setTextBox] = React.useState("debug");

  // convert file to bytes data
  const convertFileToBytes = (inputFile) => {
    console.log('converting file to bytes...');
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(inputFile); // reads file as bytes data

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  // handle file input
  const handleChange = async (event) => {
    // Clear output text.
    setOutputFileData("");

    console.log('newly uploaded file');
    const inputFile = event.target.files[0];
    console.log(inputFile);

    // convert file to bytes data
    const base64Data = await convertFileToBytes(inputFile);
    const base64DataArray = base64Data.split('base64,'); // need to get rid of 'data:image/png;base64,' at the beginning of encoded string
    const encodedString = base64DataArray[1];
    setInputFileData(encodedString);
    console.log('file converted successfully');

    // enable submit button
    setButtonDisable(false);
  }

  // handle file submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // temporarily disable submit button
    setButtonDisable(true);
    setButtonText('Loading Result');

    // make POST request
    console.log('making POST request...');
    fetch('<api-url>', {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Accept": "text/plain" },
      body: JSON.stringify({ "image": inputFileData })
    }).then(response => response.json())
    .then(data => {
      console.log('getting response...')
      console.log(data);

      // POST request error
      if (data.statusCode === 400) {
        const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
        setOutputFileData(outputErrorMessage);
      }

      // POST request success
      else {
        const outputBytesData = JSON.parse(data.body)['outputResultsData'];
        setOutputFileData(decodeFileBase64(outputBytesData));
      }

      // re-enable submit button
      setButtonDisable(false);
      setButtonText('Submit');
    })
    .then(() => {
      console.log('POST request success');
    })
  }

  // handle initial money input
  const inputInitialMoney = async (event) => {
    // retrive input initial money value
    setInitialMoney(event.target.value);
  }

  const inputTimeRange = async (event) => {  
    var list = document.getElementById("selectTimeRange");  
    setTimeRange(list.options[list.selectedIndex].text);  
  } 

  const inputCompany = async (event) => {
    var list = document.getElementById("selectCompany"); 
    const companyName = list.options[list.selectedIndex].text;
    if (companyName == "Google") {
      setCompany("goog");
    } else {
      setCompany("goog");
    }

    
  }

  const handleSubmitDebug = (event) => {
    event.preventDefault();

    const debugMessage = initialMoney + ' ' + timeRange + ' ' + company;
    setTextBox(debugMessage);
  }
  
  return (
    <div className="App">
      <div className="Input">
        <h1>Input</h1>
        <form onSubmit={handleSubmitDebug}>
          <div>
            <b> Select time range from the list</b>  
            <select id="selectTimeRange" onchange={inputTimeRange} required>  
              <option> ---Choose Time Range--- </option>  
              <option> year </option>  
              <option> month </option>  
              <option> week </option>   
            </select>
            <span class="validity"></span>
          </div>
          <div>
            <b> Select company from the list</b>  
              <select id="selectCompany" onchange={inputCompany} required>  
                <option> ---Choose Company--- </option>  
                <option> Google </option>  
              </select>
              <span class="validity"></span>
            </div>
          <div>
            <label for="initial_money">Initial money to invest (from 1000 to 1e6): </label>
            <input id="initial_money" type="number" name="initial_money" min="1000" max="1000000" step="100" required
                placeholder="e.g. 1000" onchange={inputInitialMoney} />
            <span class="validity"></span>
          </div>
          <div>
            <button type="submit" disabled={buttonDisable}>{buttonText}</button>
          </div>
        </form>
      </div>
      <div className="Output">
        <h1>Results</h1>
        <p>{outputFileData}</p>
      </div>
      <div className="Debug_Report">
        <p>
          {textBox}
        </p>
      </div>
    </div>
  );
}

export default App;
