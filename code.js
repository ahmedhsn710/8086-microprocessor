let editor = document.querySelector("#editor");
let run = document.querySelector("#run-button");

let a = ace.edit(editor, {
  theme: "ace/theme/cobalt",
  mode: "ace/mode/assembly_x86",
});

class Register {
	constructor(reg_name) {
		this.reg_name = reg_name;
	}
	
	setReg(value)
	{
		let bin = value.toString(2); // convert binary string
		
		bin = bin.padStart(16, "0"); // append with zeros
		
		console.log(bin);
		for(let i = 0; i < bin.length; i++)
		{
			const tagID = this.reg_name + "_" + i;
			document.getElementById(tagID).innerHTML = bin[bin.length - i - 1];
		}
	}

  getReg()
  {
    let value = "";
    for(let i = 0; i < 16; i++)
		{
			const tagID = this.reg_name + "_" + i;
			value += document.getElementById(tagID).innerText;
		}
    return value;
  }
}

function reverseString(str) {
  if (str === "") // This is the terminal case that will end the recursion
    return "";
  
  else
    return reverseString(str.substr(1)) + str.charAt(0);
}

run.addEventListener('click', () => {
    const allcode = a.getValue();
    let code = allcode.split("\n");
    console.log(code);

    for(let i = 0; i < allcode.length; i++)
		{
			AsmToMch(code[i]);
      console.log(code[i]);
		}
	  
})

let regs = ["ax","bx","cx","dx","cs","ds","ss","ip"];

function isregister(val)
{
  for(let i=0; i<regs.length; i++)
  {
    if(val === regs[i])
    {
      return true;
    }
  }
  return false;
}

let digits = ["1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

function isnumber(val)
{
  let count =0;
  for(let i=0; i<val.length; i++)
  {
    for(let j=0; j<digits.length; j++)
  {
    if(val[i] === digits[j])
    {
      count++;
    }
  }
  }

  if(count === val.length)
  {
    return true;
  }
  return false;
}

function AsmToMch(code)
{
	const words = code.split(" ");
	const instruction = words[0]
  if( instruction[0,2] === "//")
	{

	}
	if( instruction === "mov")
	{
		const firstop = words[1].substring(0, words[1].length - 1);
		const secondop = words[2];

    if(isregister(firstop.toLowerCase()) && isregister(secondop.toLowerCase()))
    {
      let reg1 = new Register(firstop.toUpperCase());
      let reg2 = new Register(secondop.toUpperCase());
      console.log(reg2.getReg());
      reg1.setReg(reverseString(reg2.getReg().padStart(16, "0")));
    }
		
    if(isregister(firstop.toLowerCase()) && isnumber(secondop.toLowerCase()))
    {
      let reg = new Register(firstop.toUpperCase());
      reg.setReg(parseInt(secondop));
    }
		
    if(isregister(firstop.toLowerCase()) && isnumber(secondop.toLowerCase()))
    {
      let reg = new Register(firstop.toUpperCase());
      reg.setReg(parseInt(secondop));
    }
		
    
    if(isregister(firstop.toLowerCase()) && isnumber(secondop.toLowerCase()))
    {
      let reg = new Register(firstop.toUpperCase());
      reg.setReg(parseInt(secondop));
    }
		
		
	}
}
