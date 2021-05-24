//requires

const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");

const auth = {
    auth: {
        username:'admin',
        password:'emqxsecret'
    }
}

global.saverResource = null;
global.alarmResource = null;

/**************************************
* EMQX RESOURCES MANAGER
* https://docs.emqx.io/en/broker/v4.1/advanced/http-api.html#response-code
**************************************/
setTimeout(()=>{
    listResources();
}, 1000);

async function listResources(){
    try {
        const url = "http://localhost:8085/api/v4/resources";
        const res = await axios.get (url, auth);
        if(res.status === 200){
            const resourcesNumber = res.data.data.length;
            console.log(resourcesNumber);  //el primer objeto data lo arma axios y a su vez emqx arma un objeto data
            if(!resourcesNumber){
                console.log("Creating EMQX webhooks resources".green);
                createResources();
            } else if (resourcesNumber == 2){
                res.data.data.forEach(resource => {
                    if(resource.description == "alarm webhook"){
                        global.alarmResource = resource;
                        console.log("********************");
                        console.log("ALARM RESOURCE FOUND");
                        console.log("********************");
                        console.log(global.alarmResource);                
                        console.log("\n");
                        console.log("\n");
                    }
                    if(resource.description == "saver webhook"){
                        global.saverResource = resource;
                        console.log("********************");
                        console.log("SAVER RESOURCE FOUND");
                        console.log("********************");                
                        console.log(global.saverResource);                
                        console.log("\n");
                        console.log("\n");                
                    }
                });
            }
            else{
                function printWarning(){
                    console.log("DELETE ALL WEBHOOKS EMQX RESOURCES AND RESTARTNODE - youremqxdomain:8085/#/resources".red);
                    setTimeout(()=>{
                        printWarning();
                    },1000);
                }
                printWarning();
            }
    
        }
        else{
            console.log("EMQX API error");
        }        
    } catch (error) {
        console.log("Error listing resources");
        console.log(error);
    }
 
}

async function createResources(){
    try {
        const url = "http://localhost:8085/api/v4/resources";
        const data1 = {
            "type": "web_hook",
            "config": {
                "url": "http://localhost:3001/api/saver-webhook",
                "headers": {"token":"121212"},
                "method": "POST"
            },
            "description": "saver webhook"
        }
        const data2 = {
            "type": "web_hook",
            "config": {
                "url": "http://localhost:3001/api/alarm-webhook",
                "headers": {"token":"121212"},
                "method": "POST"
            },
            "description": "alarm webhook"
        }
        const res1 = await axios.post(url, data1, auth);
        if(res1.status === 200){
            console.log("Saver resource crated!".green);
        }
        const res2 = await axios.post(url, data2, auth);
        if(res2.status === 200){
            console.log("Alarm resource crated!".green);
        }
        setTimeout(()=>{
            console.log("EMQX resources created!".green);
            listResources();
        }, 1000)        
    } catch (error) {
        console.log("Error creating rsources");
        console.log(error);
    }

}
module.exports = router;