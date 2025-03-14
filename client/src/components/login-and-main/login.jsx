import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./login.scss";

function Login({ setRole }) {
    const [optionValue, setOptionValue] = useState("Safety official");
    const [passwordValue, setPasswordValue] = useState("");
    const [loginStatusText, setLoginStatusText] = useState("");
    const navigate = useNavigate();

    function givenPassword(event) {
        setPasswordValue(event.target.value);
    }

    function chosenOption(event) {
        setOptionValue(event.target.value);
    }

    function handleLogin(event) {
        event.preventDefault();

        const dataToSend = {
            role: optionValue,
            password: passwordValue,
        };

        const fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        };

        const API_BASE_URL =
            process.env.NODE_ENV === "development"
                ? "https://racetrack-ns5c.onrender.com" // Replace with your actual backend WebSocket URL
                : "http://localhost:3000"; // Local backend for development

        fetch(`${API_BASE_URL}/api/login`, fetchOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((responseData) => {
                setRole(responseData.role);
                switch (responseData.role) {
                    case "Receptionist":
                        navigate("/front-desk");
                        break;
                    case "Racer":
                        navigate("/next-race");
                        break;
                    case "Safety official":
                        navigate("/race-control");
                        break;
                    case "Lap line obs":
                        navigate("/lap-line-tracker");
                        break;
                    case "DEV":
                        navigate("/front-desk");
                        break;
                    default:
                        setLoginStatusText("Unknown role");
                }
            })
            .catch((error) => {
                console.error("Error sending data to server:", error);
                setLoginStatusText("Invalid password");
            });
    }

    return (
        <div className='login-screen'>
            <form onSubmit={handleLogin} className='login-form'>
                <FloatingLabel controlId="floatingPassword" label="Password">
                    <Form.Control type="password" placeholder="Password" onChange={givenPassword}/>
                </FloatingLabel>
                <Form.Select aria-label="Default select example" onChange={chosenOption}>
                    <option value="Safety official">Safety official</option>
                    <option value="Receptionist">Receptionist</option>
                    {/*<option value="Racer">Race driver</option>*/}
                    <option value="Lap line obs">Lap line obs</option>
                    <option value="DEV">Developer</option>
                </Form.Select>
                <p>Password is "11" for all roles. Log in as "DEV" to check out all the features.</p>
                <p>{loginStatusText}</p>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
