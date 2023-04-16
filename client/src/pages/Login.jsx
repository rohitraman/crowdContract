import React, { useEffect, useState } from 'react';
import { CustomButton, FormFeild } from '../components';
import { useNavigate } from 'react-router-dom';
import AES from 'crypto-js/aes';
import cryptoJs from 'crypto-js';

function Login() {
    const navigate = useNavigate();
    // useEffect(() => {
    //     const user = localStorage.getItem("user");
    //     if (user) {
    //         navigate("/home");
    //     }
    // })
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = () => {
        fetch("http://localhost:5051/api/users/login", {
            method: "POST",
            body : JSON.stringify({
                name: email,
                password
            }),
            headers: {
                "Content-Type" : "application/json"
            }
        })
        .then((response) => response.text())
        .then((data) => {
            var key = 'password';
            // var e = AES.encrypt("my message", "abc").toString();
            var d = AES.decrypt(data, key);
            localStorage.setItem("user", AES.encrypt(JSON.stringify(JSON.parse(d.toString(cryptoJs.enc.Utf8)).user), key));

            navigate("/home")
        })
    }
    return (
        <div className='flex flex-col items-center'>
            <div className='w-[35%] mt-[20%] ml-[35%]'>
                <p className='text-white text-center mb-[2%] text-[22px]'>Login</p>
                <FormFeild
                    lableName="Your Email *"
                    placeholder="Email"
                    inputType="text"
                    handleChange={(e) => setEmail(e.target.value)}
                />
                <div className='mt-[3%]'>
                    <FormFeild
                        lableName="Your Password *"
                        placeholder="Password"
                        inputType="password"
                        handleChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className='text-center mt-[2%]'>
                    <CustomButton
                        btnType="button"
                        title={"Login"}
                        styles={"bg-[#1dc071]"}
                        handleClick={() => handleLogin()}
                    />
                </div>
            </div>
           
        </div>
    )
}

export default Login;