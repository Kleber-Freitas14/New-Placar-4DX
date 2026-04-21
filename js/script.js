// Objeto global para instâncias dos gráficos
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
                    <button onclick="concluir(${proc.id})" class="btn btn-success btn-sm" title="Concluir">✔</button>
                    <button onclick="abrirModalEdicao(${proc.id})" class="btn btn-warning btn-sm" title="Editar">✏️</button>
                    <button onclick="excluir(${proc.id})" class="btn btn-danger btn-sm" title="Excluir">🗑</button>
                </td>
            </tr>
        `;
    });
}

// ==========================
// FUNÇÕES DE EDIÇÃO (VOLTOU)
// ==========================
function abrirModalEdicao(id) {
    const processos = JSON.parse(localStorage.getItem("processos")) || [];
    const proc = processos.find(p => p.id === id);

    if (proc) {
        document.getElementById("editId").value = proc.id;
        document.getElementById("editDescricao").value = proc.descricao;
        document.getElementById("editSetor").value = proc.setor;
        document.getElementById("editColaborador").value = proc.colaborador;

        // Mostra o modal do Bootstrap
        const modalElement = document.getElementById('modalEditar');
        if (modalElement) {
            const meuModal = new bootstrap.Modal(modalElement);
            meuModal.show();
        }
    }
}

function salvarEdicao() {
    const id = parseInt(document.getElementById("editId").value);
    let processos = JSON.parse(localStorage.getItem("processos")) || [];

    processos = processos.map(p => {
        if (p.id === id) {
            return {
                ...p,
                descricao: document.getElementById("editDescricao").value,
                setor: document.getElementById("editSetor").value,
                colaborador: document.getElementById("editColaborador").value
            };
        }
        return p;
    });

    localStorage.setItem("processos", JSON.stringify(processos));
    
    // Fecha o modal
    const modalElement = document.getElementById('modalEditar');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }

    listarProcessos();
    gerarGraficos();
}

// ==========================
// CONCLUIR E EXCLUIR
// ==========================
function concluir(id) {
    let processos = JSON.parse(localStorage.getItem("processos")) || [];
    processos = processos.map(p => p.id === id ? { ...p, status: "Concluído" } : p);
    localStorage.setItem("processos", JSON.stringify(processos));
    listarProcessos();
    gerarGraficos();
}

function excluir(id) {
    if (!confirm("Deseja realmente excluir?")) return;
    let processos = JSON.parse(localStorage.getItem("processos")) || [];
    processos = processos.filter(p => p.id !== id);
    localStorage.setItem("processos", JSON.stringify(processos));
    listarProcessos();
    gerarGraficos();
}

// ==========================
// GRÁFICOS (SOMENTE PLACAR)
// ==========================
function gerarGraficos() {
    if (!document.getElementById("graficoEquipe")) return;

    const processos = JSON.parse(localStorage.getItem("processos")) || [];
    const mapColaboradores = {
        kleber: ["kleber"],
        ana: ["ana", "ana flávia"],
        paulo: ["ph", "paulo", "paulo henrique"]
    };

    Object.keys(mapColaboradores).forEach(nome => {
        const tarefas = processos.filter(p => {
            const col = (p.colaborador || "").toLowerCase();
            return mapColaboradores[nome].some(alias => col.includes(alias));
        });

        const total = tarefas.length;
        const concluidas = tarefas.filter(t => t.status === "Concluído").length;
        const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

        const canvasId = "grafico_" + nome;
        if (document.getElementById(canvasId)) {
            renderizarChart(canvasId, percentual, nome.toUpperCase());
        }
    });

    const totalGeral = processos.length;
    const concluidasGeral = processos.filter(p => p.status === "Concluído").length;
    const percentualEquipe = totalGeral === 0 ? 0 : Math.round((concluidasGeral / totalGeral) * 100);
    renderizarChart("graficoEquipe", percentualEquipe, "EQUIPE");
}

function renderizarChart(id, percentual, titulo) {
    const el = document.getElementById(id);
    if (!el) return;

    if (instanciasGraficos[id]) {
        instanciasGraficos[id].destroy();
    }

    instanciasGraficos[id] = new Chart(el, {
        type: "doughnut",
        data: {
            labels: ["Concluído", "Restante"],
            datasets: [{ data: [percentual, 100 - percentual] }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: titulo + " - " + percentual + "%" } }
        }
    });
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    listarProcessos();
    gerarGraficos();
});