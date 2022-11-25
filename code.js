let editor = document.querySelector("#editor");
let run = document.querySelector("#run-button");


let a = ace.edit(editor, {
  theme: "ace/theme/cobalt",
  mode: "ace/mode/assembly_x86",
});



run.addEventListener('click', () => {
    const code = a.getValue();
    console.log(code);
})

  
//saddsadasdsdasdasdsada;
