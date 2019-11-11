const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const csvParser = require('csv-parser');
const open = require('open');
const openEditor = require('open-editor');

const path = require('path');
const fs = require('fs');
const filepath = path.join(__dirname, 'data/vouchers_alassane A_20191031.csv');
let filepathImageQR =  './images/imageqr.png';
const filepathImageLogo = path.join(__dirname, 'images/logo.png');
 
// Create a document
const doc = new PDFDocument( {
        size: [145,160],
        margins : { // by default, all are 72
          top: 5,
          bottom:10,
          left: 5,
          right: 5
        }
      });
doc.pipe(fs.createWriteStream('output.pdf'));
//let lines = 0;
const ssid = 'Bloom';
const nt_type = 'none';
const prices = new Map();
const currency="Fr"
prices
.set("1", "100")
.set("24", "300")
.set("168", "1000")
.set("720", "3500");

fs.createReadStream(filepath)
  .pipe(csvParser())
  .on('data', async (data) => {  
    const {code, comment,duration} = data;
    const wifiCredntial = `WIFI:S:${ssid};T:${nt_type};P:${code};H:false;`;

    generateQR(wifiCredntial, filepathImageQR);
    const mydata = { code, comment, duration}
    generatePDF(mydata,filepathImageQR);
    })
  .on('end', () => {
    doc.end();
    //Open pdf file in VS Code must install vscode-pdf extension or any other vscode pdf viewer
     open('output.pdf', {app: 'code'});
    //you uncomment the below code to open output.pddf with the default PDF App install in your OS.
    // open('output.pdf'); 
	  console.log('The PDF viewer app quit');
  });

const generateQR =   (qr_text, qr_image_path ) => {
 
  let qrcode_png = qr.imageSync(qr_text,{ type: 'png'})
  
  fs.writeFileSync(qr_image_path, qrcode_png, (err) => {
        if(err){
            console.log(err);
        }    
    })   
}

const generatePDF =   (option,path_to_imageQR)  => {                        
  doc.fontSize(10)
  .font('Courier-BoldOblique')
  .fillColor('orange')
  .image(filepathImageLogo,{
    width: 60
  })
  .text(`WiFi ILLIMITÉ`)
  .fontSize(10)
  .fillColor('red')
  .text(price(option.duration )+ ` ${option.comment}`,{align: 'right'})
  .image(path_to_imageQR,{
    align: 'center',
    width: 70
  })
  .fontSize(10)
  .fillColor('black')
  .text(option.code)
  .addPage()
;
}

const price = (duration) => {
  return prices.get(duration)? prices.get(duration)+ currency: "Gratuit";
}

 