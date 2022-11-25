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
}

var AXreg = new Register("AX");

run.addEventListener('click', () => {
    const code = a.getValue();
	AsmToMch(code);
    console.log(code);
})

function AsmToMch(code)
{
	const words = code.split(" ");
	const instruction = words[0]
	if( instruction === "mov")
	{
		const firstop = words[1].substring(0, words[1].length - 1);
		const secondop = words[2];
		
		AXreg.setReg(parseInt(secondop));
	}
}
