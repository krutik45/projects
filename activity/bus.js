let puppeteer = require("puppeteer");
let fs = require("fs");
let path = require("path");
let source = process.argv[2];
let destination = process.argv[3];
let user_email = process.argv[4];
let date = process.argv[5];
let mail = "";
let msub = source + " to " + destination;
let {email,password} = require("../secrets");
console.log("Before");

(async function () {
    try {
        let browserInstance = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        let newPage = await browserInstance.newPage();
        await newPage.goto(
            "https://www.redbus.in/bus-tickets");

        await newPage.type("input[type='text']", source,{delay : 400});
        await newPage.click(".C120_slist-item.C120_suggestion-active",{delay : 300});
        await newPage.type("input[type='text']#txtDestination", destination,{delay : 400});
        await newPage.click(".C120_slist-item.C120_suggestion-active",{delay : 300});
        await newPage.type("input[type='text']#txtOnwardCalendar",date);
        await newPage.click(".D120_search_btn.searchBuses");
        
        await newPage.waitForSelector(".f-bold.busFound", { visible: true });

          async function autoScroll(newPage) {
            await newPage.evaluate(async () => {
              await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                  var scrollHeight = document.body.scrollHeight;
                  window.scrollBy(0, distance);
                  totalHeight += distance;
          
                  if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                  }
                }, 100);
              });
            });
          }
          await autoScroll(newPage);

        let results = await newPage.evaluate(consoleFn);
        console.log(results);
       
        let BusInfoArr = await newPage.evaluate(consoleFnBusInfo);
        for(let i = 0; i < BusInfoArr.length; i++){
            console.table(BusInfoArr[i]);
        }

        writeStream = fs.createWriteStream(path.resolve(msub + '.pdf'));

        for(let i = 0; i < BusInfoArr.length; i++){
            mail = BusInfoArr[i] + mail;
          writeStream.write(BusInfoArr[i]);
      }
      
    await newPage.goto("https://login.yahoo.com/");
    await newPage.waitForSelector(".phone-no");
    await newPage.type(".phone-no",email,{ delay: 200 });
    await newPage.waitForSelector(".pure-button.puree-button-primary.challenge-button");
    await newPage.click(".pure-button.puree-button-primary.challenge-button");
    await newPage.waitForSelector(".password");
    await newPage.type(".password",password);
    await newPage.click(".pure-button.puree-button-primary.puree-spinner-button.challenge-button");
    await newPage.waitForSelector("a[href='https://mail.yahoo.com/?.intl=in&.lang=en-IN&.partner=none&.src=fp']");
    await newPage.click("a[href='https://mail.yahoo.com/?.intl=in&.lang=en-IN&.partner=none&.src=fp']");
    await newPage.waitForSelector("a[aria-label='Compose']");
    await newPage.click("[aria-label='Compose']");
    //await newPage.waitForSelector(".typeahead-inputs-container.M_0.p_R.H_6NIX input[role='combobox']");
    await newPage.waitForNavigation();
    //await newPage.waitForSelector(".typeahead-inputs-container.M_0.p_R.H_6NIX input[role='combobox']");
    //await newPage.click(".typeahead-inputs-container.M_0.p_R.H_6NIX input[role='combobox']",{delay : 200});
    await newPage.type(".typeahead-inputs-container.M_0.p_R.H_6NIX input[role='combobox']",user_email);
    await newPage.waitForSelector('input[data-test-id="compose-subject"]');
    await newPage.type('input[data-test-id="compose-subject"]',msub);
    await newPage.click(".rte.em_N.ir_0.iy_A.iz_h.N_6Fd5");
    await newPage.type(".rte.em_N.ir_0.iy_A.iz_h.N_6Fd5",mail);
    //await newPage.waitForSelector("[data-test-id='compose-send-button']");
    //await newPage.click("[data-test-id='compose-send-button']");
    //await newPage.waitForNavigation();
    //await newPage.click("[data-test-id='compose-send-button']",{delay : 400});
    await newPage.waitForSelector('button[data-test-id="compose-send-button"]');
    await newPage.click('button[data-test-id="compose-send-button"]');
    console.log(mail);
    } catch (err) {
        console.log(err);
    }
})();

function consoleFnBusInfo() {
    let resultarr = document.querySelectorAll(".travels.lh-24.f-bold.d-color");
    let pricearr = document.querySelectorAll(".fare.d-block");
    let depTimearr = document.querySelectorAll(".dp-time.f-19.d-color.f-bold");
    let desttime = document.querySelectorAll(".bp-time.f-19.d-color.disp-Inline")
    let typearr = document.querySelectorAll(".bus-type.f-12.m-top-16.l-color");
    let seatAvailibilityarr = document.querySelectorAll(".column-eight.w-15.fl");
    let newarr = []
  
    for(let i = 0; i < resultarr.length; i++){
    
        let Name = resultarr[i].innerText;
        let price = pricearr[i].innerText;
        let dtime = depTimearr[i].innerText;
        let dettinationtime = desttime[i].innerText;
        let type = typearr[i].innerText;
        let availabeseat = seatAvailibilityarr[i].innerText;
       
        let j=i+1;
        
        newarr[i]="\n"+j+"\n"+"Name:" + Name+"\n"+"price:" + price+"\n"+"dtime:"+dtime+"\n"+"dettinationtime;"+dettinationtime+"\n"+ 
        "type:"+type+"\n"+"availabeseat:"+availabeseat+"\n" +"-----------------------------------------------------";
        
    }
  
    return newarr;
}

function consoleFn() {
    let results =document.querySelector(".f-bold.busFound").innerText;
    console.log(results);
    return results;
}


console.log("After");