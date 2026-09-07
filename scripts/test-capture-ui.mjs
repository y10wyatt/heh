import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {mkdir} from "node:fs/promises";
import path from "node:path";

// Uses the existing global Playwright installation; no app dependency is added.
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE??path.join(process.env.APPDATA,"npm/node_modules/playwright"));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];
page.on("pageerror",error=>errors.push(error.message));
const base=process.env.CAPTURE_TEST_URL??"http://127.0.0.1:5174";
const artifacts=path.resolve("artifacts/ui-task-reliability");
await mkdir(artifacts,{recursive:true});

try{
  await page.goto(base);
  await page.getByRole("button",{name:"+ Add",exact:true}).waitFor();
  assert.match(await page.locator("main").innerText(),/Start with one small task/);
  await page.getByRole("button",{name:"+ Add",exact:true}).click();
  await page.getByRole("textbox",{name:"Add task",exact:true}).fill("Read a chapter");
  await page.getByRole("button",{name:"Save task",exact:true}).click();
  await page.getByRole("button",{name:"Star Read a chapter",exact:true}).click();
  await page.reload();
  await page.getByRole("button",{name:"Complete Read a chapter",exact:true}).waitFor();
  assert.equal(await page.getByRole("button",{name:"Star Read a chapter",exact:true}).getAttribute("aria-pressed"),"true");

  // Simulate a write that commits but whose acknowledgement is lost.
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
      original.call(this,key,value);
      if(key.startsWith("sibling-showdown:demo-events:v1:")){
        Storage.prototype.setItem=original;
        throw new Error("Response lost — retry this completion");
      }
    };
  });
  await page.getByRole("button",{name:"Complete Read a chapter",exact:true}).click();
  await page.getByRole("alert").filter({hasText:"Response lost"}).waitFor();
  assert.equal(await page.getByRole("button",{name:"Retry completion Read a chapter",exact:true}).isEnabled(),true);
  await page.getByRole("button",{name:"Retry completion Read a chapter",exact:true}).click();
  await page.getByRole("button",{name:"Completed Read a chapter",exact:true}).waitFor();
  assert.equal(await page.getByRole("button",{name:"Completed Read a chapter",exact:true}).isDisabled(),true);
  await page.reload();
  await page.getByRole("button",{name:"Completed Read a chapter",exact:true}).waitFor();
  assert.equal(await page.locator(".task-row small").innerText(),"+2");
  await page.screenshot({path:path.join(artifacts,"today.png"),fullPage:true});

  await page.getByRole("link",{name:"Quick Log",exact:true}).click();
  await page.getByRole("button",{name:"Save Log",exact:true}).click();
  await page.getByRole("button",{name:"Log saved ✓",exact:true}).waitFor();
  assert.equal(await page.getByRole("button",{name:"Log saved ✓",exact:true}).isDisabled(),true);
  await page.screenshot({path:path.join(artifacts,"quick-log.png"),fullPage:true});
  const count=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith("sibling-showdown:demo-events:v1:")).length);
  assert.equal(count,2);
  await page.getByRole("button",{name:"Log another action",exact:true}).click();
  await page.getByRole("button",{name:"Save Log",exact:true}).click();
  await page.getByRole("button",{name:"Log saved ✓",exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith("sibling-showdown:demo-events:v1:")).length),3);

  await page.goto(base);
  await page.getByRole("link",{name:"Full feed",exact:true}).click();
  await page.getByRole("heading",{name:"Completed Read a chapter",exact:true}).waitFor();
  assert.equal(await page.getByRole("heading",{name:"Completed Read a chapter",exact:true}).count(),1);
  assert.deepEqual(errors,[]);
  console.log("PASS: task + star survive reload; lost response retries once; rule-derived points; Quick Log guards; single feed evidence; no page errors.");
}finally{
  await context.close();await browser.close();
}
