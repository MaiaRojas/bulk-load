const firebase = require('firebase');
const XLSX = require('xlsx');
require('dotenv').config();

firebase.initializeApp({
  apiKey: 'AIzaSyAXbaEbpq8NOfn0r8mIrcoHvoGRkJThwdc',
  authDomain: 'laboratoria-la.firebaseapp.com',
  projectId: 'laboratoria-la'
});

const workbook = XLSX.readFile(process.env.FILE_PATH);
const sheet = workbook.Sheets[process.env.SHEET_NAME];

const range = sheet['!ref'];
console.log('range', range)
const lastRow = +range.split(':')[1].substr(1);
console.log('lastRow', lastRow)
const getUserData = (index) => ({
    email: sheet[`B${index}`].v,
    password: sheet[`C${index}`].v,
    profile: {
        email: sheet[`B${index}`].v,
        name: sheet[`A${index}`].v,
        // github: sheet[`D${index}`].v,
    },
    cohorts: {
        [process.env.DEFAULT_COHORT]: process.env.DEFAULT_ROLE,
    },
});

const sendRequest = (data, token) => {
    console.log('token', token , 'data', data)
    return fetch(`https://laboratoria-la.firebaseapp.com/users/${data.email}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImZmMWRmNWExNWI1Y2Y1ODJiNjFhMjEzODVjMGNmYWVkZmRiNmE3NDgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGFib3JhdG9yaWEtbGEiLCJhdWQiOiJsYWJvcmF0b3JpYS1sYSIsImF1dGhfdGltZSI6MTU1NDIyNDI0OSwidXNlcl9pZCI6IktZM25LOUVHN3VnVEs0Yk0yZWxESFhHRUJzajEiLCJzdWIiOiJLWTNuSzlFRzd1Z1RLNGJNMmVsREhYR0VCc2oxIiwiaWF0IjoxNTU0MjI0MjQ5LCJleHAiOjE1NTQyMjc4NDksImVtYWlsIjoiY2hhcXVpQGxhYm9yYXRvcmlhLmxhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiY2hhcXVpQGxhYm9yYXRvcmlhLmxhIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.VDi6FpE-CDxfLk18vaSZC-BhocWrESJcn3guIgT08o5UQTy59AumCDir1JmXiAZ9kiYtvN4v3AIUPWR5YgPuJYAEab01lUXFJOi3E4z9HVfzBQV3CP257Cg0OB-fn4FIGjhHkSbKUgvuugXoAnKk20sF_P8Nt-FrMUd4rpDuK1yLEYReQQrd9IHTS2-hxWRD7Frv8vJ32vXcYO2krQ1HMd8nCKPlIliSOrooHFXDLCyWVdjMiu0KIVfw0mF9gDI-3rqR-JWsKJmxA9NYQSOVBmyOb4GYDftRDI3DBN3v11BJEL7er7sLSuC0K8qkhfEgZkYc6TpKtxbKKGPd9fCqHA`,
            'Content-Type': 'application/json',
        },
    });
}

const updates = [];

firebase.auth().signInWithEmailAndPassword('chaqui@laboratoria.la', 'foobar42'
    // process.env.FIREBASE_USER_EMAIL,
    // process.env.FIREBASE_USER_PASSWORD,
)
    .then(({ user }) => user.getIdToken(false))
    .then((token) => {
        console.log(token)
        Array.from({
            length: lastRow - 1
        }).forEach((row, index) => {
            console.log('index', index)
            if (sheet[`A${index + 2}`]) {
                const data = getUserData(index + 2);
                // console.log(data)
                updates.push(
                    sendRequest(data, token)
                        .then(response =>
                            console.log(
                                `Creado ${data.email}`,
                                JSON.stringify(response)
                            )
                        )
                        .catch(error => console.log('request error', error))
                );
            }
        });

        Promise.all(updates).then((values) => {
            console.log('Terminó');
            process.exit(0);
        }).catch(error => {
            console.log('error => ', error);
            process.exit(1);
        });
    })
    .catch((error) => {
        console.error('Error en autenticación', error);
    });
