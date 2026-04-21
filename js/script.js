// ==========================
// SALVAR CADASTRO
// ==========================
function salvarCadastro() {
    const descricao = document.getElementById("descricao").value;
    const setor = document.getElementById("setor").value;
    const colaborador = document.getElementById("Colaborador").value;
    const data = document.getElementById("data").value;

    if (!descricao || setor === "selecione" || colaborador === "selecione" || !data) {
        alert("Preencha todos os campos!");
        return;
    }

    const processo = {
        id: Date.now(),
        descricao,
        setor,
        colaborador,
        data,
        status: "Pendente"
    };

    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos.push(processo);

    localStorage.setItem("processos", JSON.stringify(processos));

    alert("Cadastro salvo com sucesso!");

    // Limpar campos
    document.getElementById("descricao").value = "";
    document.getElementById("setor").value = "selecione";
    document.getElementById("Colaborador").value = "selecione";
    document.getElementById("data").value = "";
}


// ==========================
// LISTAR PROCESSOS
// ==========================
function listarProcessos() {
    const tabela = document.getElementById("tabelaProcessos");

    if (!tabela) return; // evita erro se não estiver na página

    tabela.innerHTML = "";

    const processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos.forEach(proc => {

        const statusBadge = proc.status === "Concluído"
            ? `<span class="badge bg-success">Concluído</span>`
            : `<span class="badge bg-warning text-dark">Pendente</span>`;

        tabela.innerHTML += `
            <tr>
                <td>${proc.descricao}</td>
                <td>${proc.setor}</td>
                <td>${proc.colaborador}</td>
                <td>${formatarData(proc.data)}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="abrirEdicao(${proc.id})">Editar</button>
                    <button class="btn btn-sm btn-success" onclick="concluirProcesso(${proc.id})">✔</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirProcesso(${proc.id})">🗑</button>
                </td>
            </tr>
        `;
    });
}


// ==========================
// FORMATAR DATA
// ==========================
function formatarData(data) {
    if (!data) return "";

    const d = new Date(data);

    return d.toLocaleString("pt-BR");
}


// ==========================
// ABRIR MODAL DE EDIÇÃO
// ==========================
function abrirEdicao(id) {
    const processos = JSON.parse(localStorage.getItem("processos")) || [];
    const proc = processos.find(p => p.id === id);

    if (!proc) {
        alert("Processo não encontrado!");
        return;
    }

    document.getElementById("editId").value = proc.id;
    document.getElementById("editDescricao").value = proc.descricao;
    document.getElementById("editSetor").value = proc.setor;
    document.getElementById("editColaborador").value = proc.colaborador;
    document.getElementById("editData").value = proc.data;

    const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
    modal.show();
}


// ==========================
// SALVAR EDIÇÃO
// ==========================
function salvarEdicao() {
    const id = Number(document.getElementById("editId").value);

    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos = processos.map(p => {
        if (p.id === id) {
            return {
                ...p,
                descricao: document.getElementById("editDescricao").value,
                setor: document.getElementById("editSetor").value,
                colaborador: document.getElementById("editColaborador").value,
                data: document.getElementById("editData").value
            };
        }
        return p;
    });

    localStorage.setItem("processos", JSON.stringify(processos));

    listarProcessos();

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
    if (modal) modal.hide();
}


// ==========================
// CONCLUIR PROCESSO
// ==========================
function concluirProcesso(id) {
    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos = processos.map(p => {
        if (p.id === id) {
            return { ...p, status: "Concluído" };
        }
        return p;
    });

    localStorage.setItem("processos", JSON.stringify(processos));

    listarProcessos();
}


// ==========================
// EXCLUIR PROCESSO
// ==========================
function excluirProcesso(id) {
    if (!confirm("Deseja excluir este processo?")) return;

    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos = processos.filter(p => p.id !== id);

    localStorage.setItem("processos", JSON.stringify(processos));

    listarProcessos();
}

function gerarGraficos() {
    const processos = JSON.parse(localStorage.getItem("processos")) || [];

    const dados = {
        kleber: calcularPercentual(processos, "kleber"),
        ana: calcularPercentual(processos, "ana"),
        ph: calcularPercentual(processos, "ph"),
        equipe: calcularPercentualGeral(processos)
    };

    criarGrafico("graficoKleber", dados.kleber, "Kleber");
    criarGrafico("graficoAna", dados.ana, "Ana Flávia");
    criarGrafico("graficoPaulo", dados.ph, "Paulo Henrique");
    criarGrafico("graficoEquipe", dados.equipe, "Equipe");
}

function calcularPercentual(processos, pessoa) {
    const tarefas = processos.filter(p => p.colaborador === pessoa);

    if (tarefas.length === 0) return 0;

    const concluidas = tarefas.filter(p => p.status === "Concluído");

    return Math.round((concluidas.length / tarefas.length) * 100);
}

function calcularPercentualGeral(processos) {
    if (processos.length === 0) return 0;

    const concluidas = processos.filter(p => p.status === "Concluído");

    return Math.round((concluidas.length / processos.length) * 100);
}

function criarGrafico(id, percentual, nome) {
    const ctx = document.getElementById(id);

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Concluído", "Restante"],
            datasets: [{
                data: [percentual, 100 - percentual],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                },
                title: {
                    display: true,
                    text: percentual + "%",
                    color: "white",
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}