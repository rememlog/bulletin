const hdb = require("hdb");
const hanaCredential = require("./hana-dev.json");

const conn_config = {
    // serverNode: `${hanaCredential.host}:${hanaCredential.port}`,
    host: hanaCredential.host,
    port: hanaCredential.port,
    user: hanaCredential.user,
    password: hanaCredential.password,
    schema: hanaCredential.schema,
    useTLS: true,
    pooling: true,
    maxPoolSize: 10,
    connectionLifetime :120,
    charset: "utf-8",
    useCesu8 : false ,
    sslValidateCertificate: true
    // sslTrustStore: hanaCredential.certificate
}

const dbConnection = hdb.createClient(conn_config);
dbConnection.on("error", err => {
    console.log("Network Error")
})
dbConnection.connect(err => {
    if(err) {
        console.log("DB 점검후 서버를 재시작해주세요")
        return console.log(`DB error : ${err}`)
    }
    console.log(`DB: ${dbConnection.readyState}`)
    dbConnection.exec(`SELECT * FROM TABLES WHERE SCHEMA_NAME = '${hanaCredential.schema}' AND (TABLE_NAME = 'USER' OR TABLE_NAME =  'POSTING' OR TABLE_NAME =  'POSTING_REPLY')`, function(err,res) {
        if(err) return console.log(err)
        if(!res.length) {
            console.log("테이블이 존재하지 않아 생성합니다.")
            dbConnection.exec(`CREATE COLUMN TABLE ${hanaCredential.schema}.USER (USERID VARCHAR(50) PRIMARY KEY NOT NULL, NICKNAME VARCHAR(50) NOT NULL, PASSWORD VARCHAR(5000) NOT NULL)`, (err, res) => {
                if(err) return console.log(err)
                console.log("CREAT USER TABLE")
            });
            dbConnection.exec(`CREATE COLUMN TABLE ${hanaCredential.schema}.POSTING (POSTINGID BIGINT PRIMARY KEY NOT NULL GENERATED BY DEFAULT AS IDENTITY, USERID VARCHAR(50) NOT NULL, TITLE VARCHAR(100) NOT NULL, CONTENT VARCHAR(5000) NOT NULL)`, (err, res) => {
                if(err) return console.log(err)
                console.log("CREAT POSTING TABLE")
            });
            dbConnection.exec(`CREATE COLUMN TABLE ${hanaCredential.schema}.POSTING_REPLY (POSTINGID BIGINT NOT NULL, REPLYID BIGINT NOT NULL GENERATED BY DEFAULT AS IDENTITY, USERID VARCHAR(50) NOT NULL, CONTENT VARCHAR(5000) NOT NULL , PRIMARY KEY(POSTINGID, REPLYID));`, (err, res) => {
                if(err) return console.log(err)
                console.log("CREAT POSTING_REPLY TABLE")
            })
        }
        console.log("User, Posting, Posting_Reply 테이블 존재함")
    });
})

module.exports.dbConnection = dbConnection
module.exports.schema = hanaCredential.schema
