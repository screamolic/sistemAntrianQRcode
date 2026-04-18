import React, { useState ,useEffect } from 'react'
import Nav from '../components/Nav'
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function login({token , date}) {

    const router = useRouter();

    const redir = ()=>{
        router.replace('/');
    }


    const setDate = async()=>{
        const D = new Date();
        let d = D.getDate(); 
        if(d != date){
            console.log("confilct");
            Cookies.set("date",d,{expires:24/24});
            console.log("deleted");
        }
    }
    useEffect(()=>{
        setDate();
        if(token != "") 
            redir();
    },[]);

    const handleLogin = async (event)=>{
        event.preventDefault();
        if(validate())
        {
            try{
                // Use POST with body instead of GET with query params
                await fetch(`/api/auth`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password: pass })
                })
                .then(async(result)=>{
                    await result.json()
                    .then((x)=>{
                        if (result.ok && x._id) {
                            let id = x._id;
                            console.log(id);
                            Cookies.set("user",id,{expires:1/24});
                            router.reload('/login');
                        } else {
                            alert(x.error || "Wrong Credentials!")
                        }
                    })
                    .catch((err)=>{
                        console.log(err);
                        alert("Login failed!");
                    })
                })
                .catch((err)=>{
                    console.log(err);
                    alert("Login failed!");
                })
            }
            catch(err){
                console.log(err);
                alert("Login failed!");
            }
        }
    }

    const [email,setEmail] = useState("");
    const [pass,setPass] = useState("");


    const validate = () => {
        if (email === "") {
            alert("Enter Email!");
            return;
        }
        if(pass === "")
        {
            alert("Enter password!");
            return;
        }
        return true;

    }


    return (
        <div>
            <Nav cook={token} />

            <form className="container text-center border border-light p-5" action="#!">

                <p className="h4 mb-4">Sign in</p>

                <input 
                    type="email" 
                    id="defaultLoginFormEmail" 
                    className="form-control mb-4" 
                    placeholder="E-mail" 
                    onChange={(e)=>{setEmail(e.target.value)}}
                />

                <input 
                    type="password" 
                    id="defaultLoginFormPassword" 
                    className="form-control mb-4" 
                    placeholder="Password" 
                    onChange={(e)=>{setPass(e.target.value)}}
                />

                <div>
                    <button 
                        className="btn btn-info btn-block my-4" 
                        type="submit"
                        onClick={handleLogin}
                    >
                        Sign in
                    </button>
                </div>
                <p>Not a member?
                    <a href="/signup">Register</a>
                </p>
            </form>
        </div>
    )
}




export function getServerSideProps({ req , res }){
    let token = "" , date = "";
    if(req.cookies.user != undefined){
        token = req.cookies.user;
    }
    if(req.cookies.date  != undefined){
        date = req.cookies.date;
    }
    return { props : { token : token , date : date } };
}
