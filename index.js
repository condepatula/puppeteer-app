const puppeteer=require('puppeteer');
const hbs=require('handlebars');
const path=require('path');
const fs=require('fs-extra');

/**Compilar el archivo handlebar a html con los datos JSON incluídos */
const compile=async function(templateName,data){
    const filePath=path.join(process.cwd(),'templates',`${templateName}.hbs`);
    const html=await fs.readFile(filePath,'utf-8');
    hbs.registerHelper('eq',function (v1,v2,options){
        if(v1===v2){
            return options.fn(this);
        }else{
            return options.inverse(this);
        }
    });
    return hbs.compile(html)(data);
}

/**Codificar imagen en base 64 para que se pueda renderizar en el pdf */
const base64_encode=function (fileName){
    const filePath=path.join(process.cwd(),'templates',fileName);
    const bitmap=fs.readFileSync(filePath);
    return Buffer.from(bitmap).toString('base64');
}

const logoBase64=base64_encode('logo.png');
const logo=`data:image/png;base64,${logoBase64}`;

const data={
    emisor:{
        ruc:'80009057',
        dv:0,
        nombre:'SHOPPING CENTER PARAGUAY S.A.',
        telefono:'021611780',
        email:'info@delsol.com.py',
        direccion:'Avda. Aviadores del Chaco e/ Prof. Delia González',
        pais:'Paraguay',
        ciudad:'Asunción',
        type:1
    }
};

(async function(){
    try {
        const browser=await puppeteer.launch();
        const page=await browser.newPage();
        const content=await compile('invoice',{...data,logo});
        
        await page.setContent(content);
        await page.pdf({
            path:'output.pdf',
            format:'a4'
        });
        console.log('Done!');
        await browser.close();
    } catch (error) {
        console.log('Error',error);
    }
})();