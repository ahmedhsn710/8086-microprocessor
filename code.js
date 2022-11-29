let editor = document.querySelector("#editor");
let run = document.querySelector("#run-button");
let decode = document.querySelector("#decode-button");
let lineNo = 0;
let digits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

// A array of pairs where first item is regname and second item is regcode
let regs = [ ["ax", "000"], ["bx", "011"], ["cx", "001"], ["dx", "010"],
		["sp", "100"], ["bp", "101"], ["si", "110"], ["di", "111"] ];


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


// Utility Functions

function isregister(val)
{
  for(let i=0; i<regs.length; i++)
  {
    if(val === regs[i][0])
    {
      return true;
    }
  }
  return false;
}

function getRegCode(name)
{
  for(let i=0; i<regs.length; i++)
  {
    if(name === regs[i][0])
    {
      return regs[i][1];
    }
  }
  console.log("ERROR: getRegCode called on non-reg name");
  return "";
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

function getLittleEndian(binstr) {
	if(binstr.length == 16)
	{
		return binstr.substr(8) + binstr.substr(0, 8);
	}
	console.log("ERROR: getLittleEndian called on non-word");
	return binstr;
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

// Updates Machine code
function updateMachineCode(binstr)
{
	for(let i = 8; i < binstr.length; i+=8) // Loop through and add " " after every byte
	{
		binstr = binstr.substr(0, i) + " " + binstr.substr(i);
		i++;
	}
	for(let i = 17; i < binstr.length; i += 17) // Loop through and remove " " after every word then add "\n"
	{
		binstr = binstr.substr(0, i) + "\n" + binstr.substr(i+1);
		i++;
	}
	document.getElementById("MachCode").innerText = binstr;
}

// Main Conversion Function
function AsmToMch(code)
{
  console.log(code);
	const words = code.split(" ");
	const instruction = words[0].toLowerCase();

	if( instruction[0,2] === "//")
	{
		console.log("OHH YEAAAA! comment");
	}

	if( instruction === "mov" )
	{
		const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
		const secondop = words[2].toLowerCase();
		console.log("OHH YEAAAA! mov");
	
		// Register to Register 
		if(isregister(firstop) && isregister(secondop))
		{
			console.log("OHH YEAAAA! direct");
			let reg1 = new Register(firstop.toUpperCase());
			let reg2 = new Register(secondop.toUpperCase());
			console.log(reg2.getReg());
			reg1.setReg(reg2.getReg().padStart(16, "0"));
			
			let machCode = "100010"; //opcode
			machCode += "1"; //dir
			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += getRegCode(firstop); //reg
			machCode += getRegCode(secondop); //r/m
			console.log(machCode);
			updateMachineCode(machCode);
		}
		
		// Immidate data to register
		if(isregister(firstop) && isnumber(secondop))
		{
			console.log("OHH YEAAAA! immediate");
			let reg = new Register(firstop.toUpperCase());
			reg.setReg(parseInt(secondop));
			
			let machCode = "1100011"; //opcode
			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "000"; //fixed
			machCode += getRegCode(firstop); //r/m
			machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //data
			console.log(machCode);
			updateMachineCode(machCode);
		}
		
		// Immidate data to memory
		if(ismemory(firstop) && isnumber(secondop))
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
				
				let machCode = "1100011"; //opcode
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "000"; //fixed
				machCode += "110"; //r/m
				machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //data
				console.log(machCode);
				updateMachineCode(machCode);
			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{
				console.log("OHH YEAAAA! MEM INDIRECT");
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				mem.setReg(parseInt(secondop));
				
				let machCode = "1100011"; //opcode
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "000"; //fixed
				machCode += "111"; //r/m <- NOT SURE ABOUT THIS
				machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //data
				console.log(machCode);
				updateMachineCode(machCode);
			}	
		}
		
		// Memory to register
		if(isregister(firstop) && ismemory(secondop))
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
				
				let machCode = "100010"; //opcode
				machCode += "1"; //dir
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += getRegCode(firstop); //reg
				machCode += "110"; //r/m
				console.log(machCode);
				updateMachineCode(machCode);
			}

			// Memory location in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{
				console.log("OHH YEAAAA! REG INDIRECT");
				let reg2 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg2.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg2 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				reg1.setReg(mem.getReg().padStart(16,"0"));
				
				let machCode = "100010"; //opcode
				machCode += "1"; //dir
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += getRegCode(firstop); //reg
				machCode += "111"; //r/m <- NOT SURE ABOUT THIS
				console.log(machCode);
				updateMachineCode(machCode);
			}
		}

		// register to memory 
		if(ismemory(firstop) && isregister(secondop))
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
				
				let machCode = "100010"; //opcode
				machCode += "0"; //dir
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += getRegCode(secondop); //reg
				machCode += "110"; //r/m
				console.log(machCode);
				updateMachineCode(machCode);
			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{
				console.log("OHH YEAAAA! REG INDIRECT");
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				mem.setReg(reg2.getReg().padStart(16,"0"));
				
				let machCode = "100010"; //opcode
				machCode += "1"; //dir
				machCode += "0"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += getRegCode(secondop); //reg
				machCode += "111"; //r/m <- NOT SURE ABOUT THIS
				console.log(machCode);
				updateMachineCode(machCode);
			}			
		}
	}

	if( instruction === "inc")
	{
		const operand = words[1].toLowerCase();
		if(isregister(operand))
		{
			let reg = new Register(operand.toUpperCase());
			let val = parseInt(reg.getReg(), 2);
			val++;
			reg.setReg(val);
			
			let machCode = "1111111"; //opcode
			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "000"; //fixed
			machCode += getRegCode(operand); //r/m
			console.log(machCode);
			updateMachineCode(machCode);
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
				
				let machCode = "1111111"; //opcode
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "000"; //fixed
				machCode += "110"; //r/m
				machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //data
				console.log(machCode);
				updateMachineCode(machCode);
			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val++;
				mem.setReg(val);
				
				let machCode = "1111111"; //opcode
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "000"; //fixed
				machCode += "111"; //r/m  <- NOT SURE ABOUT THIS
				console.log(machCode);
				updateMachineCode(machCode);
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
			
			let machCode = "1111111"; //opcode
			machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
			machCode += "11"; //mod
			machCode += "001"; //reg
			machCode += getRegCode(operand); //r/m
			console.log(machCode);
			updateMachineCode(machCode);
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
				
				let machCode = "1111111"; //opcode
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "001"; //fixed
				machCode += "110"; //r/m
				machCode += getLittleEndian( parseInt(secondop).toString(2).padStart(16, "0") ); //data
				console.log(machCode);
				updateMachineCode(machCode);
			}

			// memory in register (NEED TO CHECK MACHINE CODE FOR THIS)
			if(isregister(memloc))
			{
				let reg1 = new Register(memloc.toUpperCase());
				let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
				hexmem = "f" + hexmem;
				let mem = new Register (hexmem.toUpperCase());
				let val = parseInt(mem.getReg(), 2);
				val--;
				mem.setReg(val);
				
				let machCode = "1111111"; //opcode
				machCode += "1"; //w-bit (CHANGE THIS CODE WHEN BYTE MOV FUNCTIONALITY ADDED)
				machCode += "00"; //mod
				machCode += "001"; //fixed
				machCode += "111"; //r/m  <- NOT SURE ABOUT THIS
				console.log(machCode);
				updateMachineCode(machCode);
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
    if( instruction === "and")//instruction for bitwise and.
    {
      const firstop = words[1].substring(0, words[1].length - 1).toLowerCase();
	  const secondop = words[2].toLowerCase();
      if(isregister(firstop))// First operand is a register. This has three cases.
      {
        let reg1 = new Register(firstop.toUpperCase());
		let val1 = parseInt(reg1.getReg(), 2);
		let val2;
			if(isnumber(secondop)) // case1. Second operand is immediete.
			{
				val2 = parseInt(secondop);
			}
      
      		if(isregister(secondop))// case2. Second operand is also a register.
			{
				let reg2 = new Register(secondop.toUpperCase());
				val2 = parseInt(reg2.getReg(), 2);
			}
			if(ismemory(secondop))// case3. Second operand is memory. This further has three cases.
			{
				const memloc = secondop.substring(1,secondop.length-1); //remove []
				if(isregister(memloc))//case1. Memory is inside reg.
				{
					let reg = new Register(memloc.toUpperCase());
					let hexmem = parseInt(reg.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
					hexmem = "f" + hexmem;
					let mem = new Register (hexmem.toUpperCase());
					val2 = parseInt(mem.getReg(), 2);
				}
				if(isnumber(memloc))//case 2. Memory is given directly.
				{
					let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
					hexmem = "f" + hexmem;
					console.log(hexmem);
					let mem = new Register (hexmem.toUpperCase());
					val2 = parseInt(mem.getReg(), 2);
				}
			}
			console.log(val1, val2, val1&val2);
			reg1.setReg(val1&val2);
	  }
      if(ismemory(firstop))//First operand is memory. This has two cases.
      { 
        const memloc = firstop.substring(1,firstop.length-1); //remove []
		let val2;
		let val1;
		let mem;
		if(isregister(memloc))//case1. memory is inside a register. This further has two cases.
		{
			let reg1 = new Register(memloc.toUpperCase());
			let hexmem = parseInt(reg1.getReg().padStart(16, "0"),2).toString(16); //contains hex of reg1 data.
			hexmem = "f" + hexmem;
			mem = new Register (hexmem.toUpperCase());
			val1 = parseInt(mem.getReg(), 2);
			if(isregister(secondop))//case 1. Second operand is a register.
			{
				let reg2 = new Register(secondop.toUpperCase());
				val2 = parseInt(reg2.getReg(), 2);
			}
			if(isnumber(secondop))//case2. Second operand is a number.
			{
				val2 = parseInt(secondop);
			}
		}
		if(isnumber(memloc))//case2. Memory available directly. This further has two cases.
		{
			let hexmem = parseInt(memloc,10).toString(16); // converts int num inside brackets to hex
			hexmem = "f" + hexmem;
			console.log(hexmem);
			mem = new Register (hexmem.toUpperCase());
			val1 = parseInt(mem.getReg(), 10);
			if(isregister(secondop))//case1. Second operand is a register.
			{
				let reg2 = new Register(secondop.toUpperCase());
				val2 = parseInt(reg2.getReg(), 2);
			}
			if(isnumber(secondop))//case2. Second operand is a number.
			{
				val2 = parseInt(secondop);
			}
		}
		mem.setReg(val1&val2);
      }
    }
}

