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
    return fetch(`https://laboratoria-la-staging.firebaseapp.com/users/${data.email}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBmNTVkZWZlOWU5YzU2ZmRhZTRkOGY0MDFjZjQ5Njc4YzE2N2MzYWEifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGFib3JhdG9yaWEtbGEtc3RhZ2luZyIsImF1ZCI6ImxhYm9yYXRvcmlhLWxhLXN0YWdpbmciLCJhdXRoX3RpbWUiOjE1MzYzNTA5MDYsInVzZXJfaWQiOiJ5b00zNFA5RElYWmhteWNMbU96UjEzeE85R1YyIiwic3ViIjoieW9NMzRQOURJWFpobXljTG1PelIxM3hPOUdWMiIsImlhdCI6MTUzNjM1MDkwNiwiZXhwIjoxNTM2MzU0NTA2LCJlbWFpbCI6ImNoYXF1aUBsYWJvcmF0b3JpYS5sYSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImNoYXF1aUBsYWJvcmF0b3JpYS5sYSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.GABZ-LCr5q-2cXGc5q1UsLHTHPItpHj_2zNC6YY_9oxjNp7PlqquCkeqUYqA2H3dumDKhnAwIJF2O7Zdtlv9va8PUPeR15BZLCt19xuV3LnsTKOcjZYFEe8O0YsNC6GENQPPdPPrx2C_zuDlj3NKWKGyJCyhi-xWsfhVdQlQeZsIDPtqciGayEY4_g8DB6crcutUggjK43vhdtYe6g2MOHBDmWc7lbArxVtYtZ9Y-TfVyaUgCOIL_nGR_wAb6YWI9eHh69JdDx45JdaFIyutOvUqV6eC1Pqk-M6_2KD__iEH0LgRLlxJVdMkgqRSJbiOl5hkzKLErmAJXTBmXndwwA`,
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
