function exibirMail() {
  let usuario = localStorage.getItem("usuario");
  if (usuario) {
    usuario = JSON.parse(usuario);
    document.getElementById("mail").innerText = usuario.mail;
  }
}

function listarQuestao() {
  // Verifica se o usuário está logado
  if (!usuarioLogado) {
    // Esconde o botão de logout
    document.getElementById("botao-logout").style.display = "none";
    document.getElementById("saida").innerHTML =
      "<p>O usuário não está logado. Clique para efetuar o <a href='./login.html'>login</a>.</p>";
  } else {
    // Configuração da requisição
    const url = `${urlbase}/questao`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idusuario: usuarioLogado.idusuario }),
    };

    // Submete a requisição
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          alert("Erro na requisição");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        //verifica se existe algum erro
        if (data.erro) {
          alert(data.erro);
        } if( data.idquestionario ){
          document.getElementById("saida").innerHTML = `
            <h4>Você já foi aprovado com a nota ${data.nota} no questionário realizado em ${data.datahorario}.</h4>
            <a href="./respostas.html">Ver o seu questionário</a>
          `;
        }else {
          let questoes = "";
          for (i = 0; i < data.length; i++) {
            questoes += `<div class='questao'>
            <div class='linha-enunciado'>${data[i].enunciado}</div>
            <div class='linha-alternativa'>
              <input type="hidden" value="${data[i].idquestao}"/>
              <div class='item-alternativa'>
                <input type="radio" value="true" name="questao-opcao-${data[i].idquestao}" id="verdadeiro${i}">
                <label for="verdadeiro${i}">Verdadeiro</label>
              </div>
              <div class='item-alternativa'>
                <input type="radio" value="false" name="questao-opcao-${data[i].idquestao}" id="falso${i}">
                <label for="falso${i}">Falso</label>
              </div>
            </div>
          </div>`;
          }
          document.getElementById("saida").innerHTML = `<h3>Questões</h3>${questoes}`;
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }
}

function enviarRespostas() {
  let usuario = localStorage.getItem("usuario");
  if (usuario) {
    usuario = JSON.parse(usuario);
    if (usuario.idusuario) {
      const questoes = [];
      // obter as questões
      const tags = document.getElementsByClassName("linha-alternativa");
      for (let i = 0; i < tags.length; i++) {
        idquestao = tags[i].children[0].value;

        //Opção true
        if (tags[i].children[1].children[0].checked) {
          resposta = true;
        } else if (tags[i].children[2].children[0].checked) {
          //Opção false
          resposta = false;
        } else {
          alert(`A questão ${i + 1} não foi respondida`);
          break;
        }
        questoes.push({ idquestao, resposta });
      }
      if (questoes.length == tags.length) {
        const objeto = { idusuario: usuario.idusuario, questoes };
        processarEnvioRespostas(objeto);
      }
    } else {
      alert("Usuário não identificado. Efetue o login para continuar");
    }
  } else {
    alert("Efetue o login para continuar");
  }
}

function processarEnvioRespostas(objeto) {
  // Configuração da requisição
  const url = `${urlbase}/questionario`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(objeto),
  };

  // Submete a requisição
  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        alert("Erro na requisição");
      }
      return response.json();
    })
    .then((data) => {
      if (data.nota) {
        alert(`Parabéns! Você foi aprovado com a nota ${data.nota}`);
      } else {
        alert(data.erro);
      }
    })
    .catch((error) => {
      alert(error);
    });
}
