// Objeto global para armazenar as instâncias dos gráficos e evitar erros de sobreposição
let instanciasGraficos = {};

// ==========================
// LISTAR
// ==========================
function listarProcessos() {
    const tabela = document.getElementById("tabelaProcessos");
    if (!tabela) return;

    const processos = JSON.parse(localStorage.getItem("processos")) || [];

    tabela.innerHTML = "";

    processos.forEach(proc => {

        const status = proc.status === "Concluído"
            ? `<span class="badge bg-success">Concluído</span>`
            : `<span class="badge bg-warning text-dark">Pendente</span>`;

        tabela.innerHTML += `
            <tr>
                <td>${proc.descricao}</td>
                <td>${proc.setor}</td>
                <td>${proc.colaborador}</td>
                <td>${new Date(proc.data).toLocaleString("pt-BR")}</td>
                <td>${status}</td>
                <td>
                    <button onclick="concluir(${proc.id})" class="btn btn-success btn-sm">✔</button>
                    <button onclick="excluir(${proc.id})" class="btn btn-danger btn-sm">🗑</button>
                </td>
            </tr>
        `;
    });
}

// ==========================
// CONCLUIR
// ==========================
function concluir(id) {
    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos = processos.map(p => {
        if (p.id === id) {
            return { ...p, status: "Concluído" };
        }
        return p;
    });

    localStorage.setItem("processos", JSON.stringify(processos));

    listarProcessos();
    gerarGraficos();
}

// ==========================
// EXCLUIR
// ==========================
function excluir(id) {
    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos = processos.filter(p => p.id !== id);

    localStorage.setItem("processos", JSON.stringify(processos));

    listarProcessos();
    gerarGraficos();
}

// ==========================
// GRÁFICOS (CORRIGIDO)
// ==========================
function gerarGraficos() {

    const processos = JSON.parse(localStorage.getItem("processos")) || [];

    const map = {
        kleber: ["kleber"],
        ana: ["ana", "ana flávia"],
        paulo: ["ph", "paulo", "paulo henrique"]
    };

    Object.keys(map).forEach(nome => {

        const tarefas = processos.filter(p => {
            const col = (p.colaborador || "").toLowerCase();
            return map[nome].some(alias => col.includes(alias));
        });

        const total = tarefas.length;
        const concluidas = tarefas.filter(t => t.status === "Concluído").length;

        const percentual = total === 0
            ? 0
            : Math.round((concluidas / total) * 100);

        const canvasId = "grafico_" + nome;

        if (document.getElementById(canvasId)) {
            criarGrafico(canvasId, percentual, nome.toUpperCase());
        }
    });

    const equipe = calcularEquipe(processos);
    if (document.getElementById("graficoEquipe")) {
        criarGrafico("graficoEquipe", equipe, "EQUIPE");
    }
}

// ==========================
// EQUIPE
// ==========================
function calcularEquipe(processos) {
    if (processos.length === 0) return 0;

    const concluidas = processos.filter(p => p.status === "Concluído");

    return Math.round((concluidas.length / processos.length) * 100);
}

// ==========================
// CRIAR GRÁFICO (COM LIMPEZA DE INSTÂNCIA)
// ==========================
function criarGrafico(id, percentual, nome) {

    const el = document.getElementById(id);
    if (!el) return;

    // Destrói o gráfico existente antes de criar um novo para evitar bugs visuais
    if (instanciasGraficos[id]) {
        instanciasGraficos[id].destroy();
    }

    instanciasGraficos[id] = new Chart(el, {
        type: "doughnut",
        data: {
            labels: ["Concluído", "Restante"],
            datasets: [{
                data: [percentual, 100 - percentual]
                // Cores padrão mantidas conforme solicitado
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: nome + " - " + percentual + "%"
                }
            }
        }
    });
}

// ==========================
// INICIALIZAÇÃO
// ==========================
document.addEventListener("DOMContentLoaded", function () {
    listarProcessos();
    gerarGraficos();
});