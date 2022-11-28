let editor = document.querySelector("#editor");
let run = document.querySelector("#run-button");
let decode = document.querySelector("#decode-button");
let lineNo = 0;
let digits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
let regs = ["ax","bx","cx","dx","cs","ds","ss","ip"];

let a = ace.edit(editor, {
  theme: "ace/theme/cobalt",
  mode: "ace/mode/assembly_x86",
});


// Generic R/M class
class Register {
	constructor(reg_name) {
		this.reg_name = reg_name;
	}
	
	setReg(value)
	{
		let bin = value.toString(2); // convert binary string
		
		bin = bin.padStart(16, "0"); // append with zeros
		
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
    return reverseString(value);
  }

}

// Run Button Click
run.addEventListener('click', () => {
	lineNo = 0;
    const allcode = a.getValue();
    let code = allcode.split("\n");
    console.log(code);

    for(let i = 0; i < code.length; i++)
	{
		AsmToMch(code[i]);
		console.log(code[i]);
	}	  
})


// Decode Button Click
decode.addEventListener('click', () => {
    const allcode = a.getValue();
    let code = allcode.split("\n");
	let totallines = code.length;
	if(lineNo <= totallines)
	{
		console.log(code);

		AsmToMch(code[lineNo]);
		console.log(code[lineNo]);	  
		lineNo++;
	}
    
})

// Utility Functions and Variables

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

function ismemory(val) //checking input if its from memory;
{
  if(val.charAt(0) =="[" && val.charAt(val.length-1 == "]"))
  {
      return true;
  }
  
  if(val.charAt(0) =="[" && val.charAt(val.length-1 !== "]"))
  {
    console.log("Error!");
    return false;
  }
  return false;
}

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

function reverseString(str) {
  if (str === "") // This is the terminal case that will end the recursion
    return "";
  
  else
    return reverseString(str.substr(1)) + str.charAt(0);
}

function isbinary(str, i =0)
{
	if(i == str.length)
	{
		return true;
	}
	if(str[i] == 0 || str[i] == 1)
	{
		let ret = isbinary(str, ++i);
		return ret;
	}
	return false;
	
	
}

function ishex(str, i =0)
{
	if(i == str.length)
	{
		return true;
	}
	if(str[i] == 0 || str[i] == 1)
	{
		let ret = isbinary(str, ++i);
		return ret;
	}
	return false;
	
	
}

// Main Conversion Function
function AsmToMch(code)
{
    console.log(code);
	const words = code.split(" ");
	const instruction = words[0]

	if( instruction[0,2] === "//")
	{
		console.log("OHH YEAAAA! comment");
	}

	if( instruction.toLowerCase() === "mov" )
	{
		const firstop = words[1].substring(0, words[1].length - 1);
		const secondop = words[2];
		console.log("OHH YEAAAA! mov");
	
		// Register to Register 
		if(isregister(firstop.toLowerCase()) && isregister(secondop.toLowerCase()))
		{
			console.log("OHH YEAAAA! direct");
			let reg1 = new Register(firstop.toUpperCase());
			let reg2 = new Register(secondop.toUpperCase());
			console.log(reg2.getReg());
			reg1.setReg(reg2.getReg().padStart(16, "0"));
		}
		
		// Immidate data to register
		if(isregister(firstop.toLowerCase()) && isnumber(secondop.toLowerCase()))
		{
			console.log("OHH YEAAAA! immediate");
			let reg = new Register(firstop.toUpperCase());
			reg.setReg(parseInt(secondop));
		}
		
		// Immidate data to memory
		if(ismemory(firstop.toLowerCase()) && isnumber(secondop.toLowerCase()))
		{
			const memloc = firstop.substring(1,firstop.length-1); //remove []

			// Direct memory
			if(isnumber(memloc))
			{
				console.log("OHH YEAAAA! MEM DIRECT");
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				mem.setReg(parseInt(secondop));
			}

			// memory in register 
			if(isregister(memloc))
			{
				console.log("OHH YEAAAA! MEM INDIRECT");
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				mem.setReg(parseInt(secondop));
			}	
		}
		
		// Memory to register
		if(isregister(firstop.toLowerCase()) && ismemory(secondop.toLowerCase()))
		{
		let reg1 = new Register(firstop.toUpperCase());
		const memloc = secondop.substring(1,secondop.length-1);

			// Direct memory
			if(isnumber(memloc))
			{
				console.log("OHH YEAAAA! REG DIRECT");
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				reg1.setReg(mem.getReg().padStart(16,"0"));
			}

			// Memory location in register
			if(isregister(memloc))
			{
				console.log("OHH YEAAAA! REG INDIRECT");
				let reg2 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg2.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg2 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				reg1.setReg(mem.getReg().padStart(16,"0"));
		
			}
		}

		// regiater to memory 
		if(ismemory(firstop.toLowerCase()) && isregister(secondop.toLowerCase()))
		{
			let reg2 = new Register(secondop.toUpperCase());
			const memloc = firstop.substring(1,firstop.length-1); //remove []
			
			// Direct memory 
			if(isnumber(memloc))
			{
				console.log("OHH YEAAAA! REG DIRECT");
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register (hexmem.toUpperCase());
				mem.setReg(reg2.getReg().padStart(16,"0"));
			}

			// memory in register 
			if(isregister(memloc))
			{
				console.log("OHH YEAAAA! REG INDIRECT");
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				mem.setReg(reg2.getReg().padStart(16,"0"));
			}			
		}
	}

	if( instruction.toLowerCase() === "inc")
	{
		const operand = words[1];
		if(isregister(operand))
		{
			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val++;
			reg.setReg(val);
		}
		if(ismemory(operand))
		{
			const memloc = operand.substring(1,operand.length-1); //remove []
			
			// Direct memory 
			if(isnumber(memloc))
			{
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val++;
				mem.setReg(val);
			}

			// memory in register 
			if(isregister(memloc))
			{
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val++;
				mem.setReg(val);
			}			
		}
	}

	if( instruction.toLowerCase() === "dec")
	{
		const operand = words[1];
		if(isregister(operand))
		{
			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val--;
			reg.setReg(val);
		}
		if(ismemory(operand))
		{
			const memloc = operand.substring(1,operand.length-1); //remove []
			
			// Direct memory 
			if(isnumber(memloc))
			{
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val--;
				mem.setReg(val);
			}

			// memory in register 
			if(isregister(memloc))
			{
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val--;
				mem.setReg(val);
			}			
		}
	}

	if( instruction.toLowerCase() === "neg")
	{
		const operand = words[1];
		if(isregister(operand))
		{
			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val = 65536 - val;
			let str= val.toString(2);
			reg.setReg(str);
		}
		if(ismemory(operand))
		{
			const memloc = operand.substring(1,operand.length-1); //remove []
			
			// Direct memory 
			if(isnumber(memloc))
			{
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65536 - val;
				let str= val.toString(2);
				mem.setReg(str);
			}

			// memory in register 
			if(isregister(memloc))
			{
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65536 - val;
				let str= val.toString(2);
				mem.setReg(str);
			}			
		}
	}

	if( instruction.toLowerCase() === "not")
	{
		const operand = words[1];
		if(isregister(operand))
		{
			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val = 65535 - val;
			let str= val.toString(2);
			reg.setReg(str);
		}
		if(ismemory(operand))
		{
			const memloc = operand.substring(1,operand.length-1); //remove []
			
			// Direct memory 
			if(isnumber(memloc))
			{
				let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
				hexmem = "f" + hexmem;
				console.log(hexmem);
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65535 - val;
				let str= val.toString(2);
				mem.setReg(str);
			}

			// memory in register 
			if(isregister(memloc))
			{
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val = 65535 - val;
				let str= val.toString(2);
				mem.setReg(str);
			}			
		}
	}
}
