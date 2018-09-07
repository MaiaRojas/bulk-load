const firebase = require('firebase');
const XLSX = require('xlsx');
require('dotenv').config();

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
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
        name: sheet[`A${index}`].v,
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
            'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBmNTVkZWZlOWU5YzU2ZmRhZTRkOGY0MDFjZjQ5Njc4YzE2N2MzYWEifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGFib3JhdG9yaWEtbGEiLCJhdWQiOiJsYWJvcmF0b3JpYS1sYSIsImF1dGhfdGltZSI6MTUzNjM1NzE1NywidXNlcl9pZCI6IktZM25LOUVHN3VnVEs0Yk0yZWxESFhHRUJzajEiLCJzdWIiOiJLWTNuSzlFRzd1Z1RLNGJNMmVsREhYR0VCc2oxIiwiaWF0IjoxNTM2MzU3MTU3LCJleHAiOjE1MzYzNjA3NTcsImVtYWlsIjoiY2hhcXVpQGxhYm9yYXRvcmlhLmxhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiY2hhcXVpQGxhYm9yYXRvcmlhLmxhIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.HLcYH027GCqKQkV8bXU1qw0XeLmRdq5aFWVAyTrHU6lu1dGyZXdMmwJaAd9oWC4b2M-F2dlwj0euLeLpLSYV_mZX60qUwnIgvJTsnyTDg-UmwEolAOPCXci_7AxShtMoj8yu7YfWQNvVx354tdy04tTiTNVbfCIRgIk2xR_s1oHRg8RU_XzlBhZrOyvKwi7b8NCdw7RnzW02m7JEu3UtAH8OPzfWttAyF-xxYWrN7Is2miQiKe8xvx3nXu5XpKeD058R1QsT2uN6IfBdvkgCg-Qnly9taQrusv1JFtkqm9yXc2rSiVQCbPRnbjR5CZrI6HXcmTdGQi-M4jJJNJ795g`,
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
                console.log(data)
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
