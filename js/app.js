async function cargarDashboard(data){
    window.dashboardData = data;
    actualizarFecha();
    actualizarDiasRestantes();
    actualizarMesas(data);
    actualizarResumenMVP(data);
    actualizarResumenDecisiones(data);
    actualizarRoadmap();
    await cargarVista("views/decisiones.html");
    actualizarSesiones(data);
    actualizarDecisiones(data);
    renderResponsables(data);
    activarFiltrosMesas();
}

function actualizarHero(data){
    const onePage = data["One page"];
    if(!onePage || onePage.length < 4){
        return;
    }
    let sesiones = 0;
    let registradas = 0;
    let cerradas = 0;
    let abiertas = 0;
    for(let i = 1; i < onePage.length; i++){
        sesiones += Number(onePage[i][2]) || 0;
        registradas += Number(onePage[i][5]) || 0;
        cerradas += Number(onePage[i][6]) || 0;
        abiertas += Number(onePage[i][7]) || 0;
    }
    document.getElementById("hero-sesiones").textContent = sesiones;
    document.getElementById("hero-registradas").textContent = registradas;
    document.getElementById("hero-cerradas").textContent = cerradas;
    document.getElementById("hero-abiertas").textContent = abiertas;
}

function actualizarDecisiones(data){
    const hoja =
        data["Definiciones pendientes"];

    if(!hoja){
        return;
    }
    const pendientes =
        document.getElementById(
            "lista-pendientes"
        );
    const realizadas =
        document.getElementById(
            "lista-realizadas"
        );
    const totalPendientes =
        document.getElementById(
            "dec-pendientes"
        );
    const totalRealizadas =
        document.getElementById(
            "dec-realizadas"
        );
    if(
        !pendientes ||
        !realizadas
    ){
        return;    }

    pendientes.innerHTML = "";
    realizadas.innerHTML = "";
    let contadorPendientes = 0;
    let contadorRealizadas = 0;
    const registros = hoja
        .slice(1)
        .sort((a,b) => {
            const prioridadA =
                String(a[6] || "")
                    .trim()
                    .toLowerCase();
            const prioridadB =
                String(b[6] || "")
                    .trim()
                    .toLowerCase();
            const ordenPrioridad = {
                "alta": 1,
                "media": 2,
                "baja": 3
            };
            const valorA =
                ordenPrioridad[prioridadA] || 99;
            const valorB =
                ordenPrioridad[prioridadB] || 99;
            if(valorA !== valorB){
                return valorA - valorB;
            }
            const fechaA =
                new Date(a[4]);
            const fechaB =
                new Date(b[4]);
            const diasA =
                Math.floor(
                    (new Date() - fechaA) /
                    (1000 * 60 * 60 * 24)
                );
            const diasB =
                Math.floor(
                    (new Date() - fechaB) /
                    (1000 * 60 * 60 * 24)
                );
            return diasB - diasA;
        });
    registros.forEach(fila => {
        const texto = fila[1];
        const responsable = fila[2];
        const mesa = fila[3];
        const fecha = fila[4];
        const estatus = fila[5];
        const prioridadOriginal = fila[6];
        const prioridad =
            String(prioridadOriginal || "")
                .trim()
                .toLowerCase();
        const fechaLevantamiento =
            new Date(fecha);
        const hoy =
            new Date();
        const diasTranscurridos =
            Math.max(
                0,
                Math.floor(
                    (hoy - fechaLevantamiento) /
                    (1000 * 60 * 60 * 24)
                )
            );
        let claseDias =
            "dias-critico";
        if(diasTranscurridos <= 2){
            claseDias =
                "dias-ok";
        }
        else if(diasTranscurridos <= 4){
            claseDias =
                "dias-alerta";
        }
        let clasePrioridad =
            "level--bajo";
        if(prioridad === "alta"){
            clasePrioridad =
                "level--alto";
        }
        else if(prioridad === "media"){
            clasePrioridad =
                "level--medio";
        }
        if(
            mesaSeleccionada !== "todas" &&
            mesa !== mesaSeleccionada
        ){
            return;
        }
        if(
            responsableSeleccionado !== "todos" &&
            responsable !== responsableSeleccionado
        ){
            return;
        }
        const esCerrado =
            String(estatus)
                .trim()
                .toLowerCase() === "cerrado";
        const tarjeta = `
            <li class="act">
                <div class="act__date">
                    <span class="act__day">
                        ${obtenerDia(fecha)}
                    </span>
                    <span class="act__mon">
                        ${obtenerMes(fecha)}
                    </span>
                    <span class="act__year">
                        ${obtenerAnio(fecha)}
                    </span>
                </div>
                <div>
                    <p class="act__title">
                        ${texto}
                    </p>
                    <p class="act__meta">
                        ${mesa}
                        •
                        ${responsable}
                    </p>
                    <p class="act__src">
                        Estatus:
                        ${estatus}
                    </p>
                </div>
                <div class="decision-side">
                    <span class="level ${clasePrioridad}">
                        ${prioridadOriginal}
                    </span>
                    ${
                        !esCerrado
                        ?
                        `
                        <div class="dias-box">

                            <strong class="${claseDias}">
                                ${diasTranscurridos}
                            </strong>
                            <span>
                                días transcurridos
                            </span>
                        </div>
                        `
                        :
                        ""
                    }
                </div>
            </li>
        `;
        if(esCerrado){
            realizadas.innerHTML += tarjeta;
            contadorRealizadas++;
        }
        else{
            pendientes.innerHTML += tarjeta;
            contadorPendientes++;
        }
    });
    if(totalPendientes){
        totalPendientes.textContent =
            contadorPendientes;
    }
    if(totalRealizadas){
        totalRealizadas.textContent =
            contadorRealizadas;
    }
}
function obtenerDia(fecha){
    const f = new Date(fecha);
    if(isNaN(f)) return "--";
    return f.getDate();
}
function obtenerMes(fecha){
    const f = new Date(fecha);
    if(isNaN(f)) return "---";
    return [
        "ene","feb","mar",
        "abr","may","jun",
        "jul","ago","sep",
        "oct","nov","dic"
    ][f.getMonth()];
}
function obtenerAnio(fecha){
    const f = new Date(fecha);
    if(isNaN(f)) return "----";
    return f.getFullYear();
}

function actualizarMesas(data){
    const onePage = data["One page"];
    if(!onePage || onePage.length < 4){
        return;
    }
    // Cumplimiento
    document.getElementById("cumplimiento-sesiones").textContent = onePage[1][2];
    document.getElementById("cumplimiento-fecha").textContent = onePage[1][4];
    document.getElementById("cumplimiento-registradas").textContent = onePage[1][5];
    document.getElementById("cumplimiento-cerradas").textContent = onePage[1][6];
    document.getElementById("cumplimiento-abiertas").textContent = onePage[1][7];
    const cumplimientoTotal =
    Number(onePage[1][6]) +
    Number(onePage[1][7]);
document.getElementById(
    "cumplimiento-bar-cerradas"
).style.width =
`${(Number(onePage[1][6]) / cumplimientoTotal) * 100}%`;
document.getElementById(
    "cumplimiento-bar-abiertas"
).style.width =
`${(Number(onePage[1][7]) / cumplimientoTotal) * 100}%`;

    // Comercial
    document.getElementById("comercial-sesiones").textContent = onePage[2][2];
    document.getElementById("comercial-fecha").textContent = onePage[2][4];
    document.getElementById("comercial-registradas").textContent = onePage[2][5];
    document.getElementById("comercial-cerradas").textContent = onePage[2][6];
    document.getElementById("comercial-abiertas").textContent = onePage[2][7];
    const comercialTotal =
    Number(onePage[2][6]) +
    Number(onePage[2][7]);
document.getElementById(
    "comercial-bar-cerradas"
).style.width =
`${(Number(onePage[2][6]) / comercialTotal) * 100}%`;
document.getElementById(
    "comercial-bar-abiertas"
).style.width =
`${(Number(onePage[2][7]) / comercialTotal) * 100}%`;

    // Tecnología
    document.getElementById("tecnologia-sesiones").textContent = onePage[3][2];
    document.getElementById("tecnologia-fecha").textContent = onePage[3][4];
    document.getElementById("tecnologia-registradas").textContent = onePage[3][5];
    document.getElementById("tecnologia-cerradas").textContent = onePage[3][6];
    document.getElementById("tecnologia-abiertas").textContent = onePage[3][7];
    const tecnologiaTotal =
    Number(onePage[3][6]) +
    Number(onePage[3][7]);
document.getElementById(
    "tecnologia-bar-cerradas"
).style.width =
`${(Number(onePage[3][6]) / tecnologiaTotal) * 100}%`;
document.getElementById(
    "tecnologia-bar-abiertas"
).style.width =
`${(Number(onePage[3][7]) / tecnologiaTotal) * 100}%`;
}

async function cargarVista(ruta){
    const response = await fetch(ruta);
    const html = await response.text();
    document.getElementById("contenido-decisiones").innerHTML = html;
}
async function cargarVistaSemanal(){
    const response =
        await fetch(
            "views/semanal.html"
        );
    const html =
        await response.text();
    document.getElementById(
        "contenido-semanal"
    ).innerHTML = html;
}

let decisionesCargadas = false;
let semanalCargado = false;
let mesaSeleccionada = "todas";
let responsableSeleccionado = "todos";
document.addEventListener("DOMContentLoaded", () => {

    const tabTablero =
        document.getElementById("tab-tablero");

    const tabDecisiones =
        document.getElementById("tab-actividades");

    const tabSemanal =
        document.getElementById("tab-semanal");

    const panelTablero =
        document.getElementById("panel-tablero");

    const panelDecisiones =
        document.getElementById("panel-actividades");

    const panelSemanal =
        document.getElementById("panel-semanal");

    tabDecisiones.addEventListener(
        "click",
        async () => {

            panelTablero.hidden = true;
            panelDecisiones.hidden = false;
            panelSemanal.hidden = true;

            tabTablero.setAttribute(
                "aria-selected",
                "false"
            );

            tabSemanal.setAttribute(
                "aria-selected",
                "false"
            );

            tabDecisiones.setAttribute(
                "aria-selected",
                "true"
            );

            if(!decisionesCargadas){

                await cargarVista(
                    "views/decisiones.html"
                );

                actualizarDecisiones(
                    window.dashboardData
                );

                renderResponsables(
                    window.dashboardData
                );

                activarFiltrosMesas();

                decisionesCargadas = true;

            }

        }
    );

    tabSemanal.addEventListener(
        "click",
        async () => {
    
            panelTablero.hidden = true;
            panelDecisiones.hidden = true;
            panelSemanal.hidden = false;
    
            tabTablero.setAttribute(
                "aria-selected",
                "false"
            );
    
            tabDecisiones.setAttribute(
                "aria-selected",
                "false"
            );
    
            tabSemanal.setAttribute(
                "aria-selected",
                "true"
            );
    
            if(!semanalCargado){
    
                await cargarVistaSemanal();

                actualizarPlanTrabajo(
                    window.dashboardData
                );

                actualizarHero(
                    window.dashboardData
                );
    
                actualizarSesiones(
                    window.dashboardData
                );
    
                semanalCargado = true;
    
            }
    
        }
    );

    tabTablero.addEventListener(
        "click",
        () => {

            panelTablero.hidden = false;
            panelDecisiones.hidden = true;
            panelSemanal.hidden = true;

            tabTablero.setAttribute(
                "aria-selected",
                "true"
            );

            tabDecisiones.setAttribute(
                "aria-selected",
                "false"
            );

            tabSemanal.setAttribute(
                "aria-selected",
                "false"
            );

        }
    );

});

function actualizarResumenDecisiones(data){
    const hoja =
        data["Definiciones pendientes"];
    const contenedor =
        document.getElementById(
            "decisiones-dashboard"
        );
    if(!hoja || !contenedor){
        return;
    }
    contenedor.innerHTML = "";
    const pendientes = hoja
        .slice(1)
        .filter(fila =>
            String(fila[5])
                .trim()
                .toLowerCase() !== "cerrado"
        )
        .sort((a,b) => {
            const orden = {
                "alta": 1,
                "media": 2,
                "baja": 3
            };
            return (
                (orden[String(a[6]).toLowerCase()] || 99)
                -
                (orden[String(b[6]).toLowerCase()] || 99)
            );
        });
    pendientes.forEach(fila => {
        const prioridad =
            String(fila[6] || "")
                .trim()
                .toLowerCase();
        const fechaLevantamiento =
            new Date(fila[4]);        
        const hoy =
            new Date();       
        const diasTranscurridos =
            Math.max(
                0,
                Math.floor(
                    (hoy - fechaLevantamiento) /
                    (1000 * 60 * 60 * 24)
                )
            );        
        let claseDias = "dias-critico";        
        if(diasTranscurridos <= 2){        
            claseDias = "dias-ok";        
        }
        else if(diasTranscurridos <= 4){        
            claseDias = "dias-alerta";        
        }
        let clasePrioridad =
            "level--bajo";
        if(prioridad === "alta"){
            clasePrioridad =
                "level--alto";
        }
        if(prioridad === "media"){
            clasePrioridad =
                "level--medio";
        }
        contenedor.innerHTML += `
            <li>
                <div class="decision__head">
                    <p class="decision__title">
                        ${fila[1]}
                    </p>
                    <div class="decision-side">                    
                        <span class="level ${clasePrioridad}">
                            ${fila[6]}
                        </span>                    
                        <div class="dias-box">                    
                            <strong class="${claseDias}">
                                ${diasTranscurridos}
                            </strong>                    
                            <span>
                                días transcurridos
                            </span>                    
                        </div>                    
                    </div>
                </div>
                <div class="decision__meta">
                    <strong>Mesa:</strong>
                    ${fila[3]}
                    <br>
                    <strong>Responsable:</strong>
                    ${fila[2]}
                </div>
            </li>
        `;
    });
}

function actualizarResumenMVP(data){
    const onePage =
        data["One page"];
    const definiciones =
        data["Definiciones pendientes"];
    if(!onePage || !definiciones){
        return;
    }
    let registradas = 0;
    let cerradas = 0;
    let abiertas = 0;
    let alta = 0;
    let media = 0;
    let baja = 0;
    // One Page
    for(let i = 1; i < onePage.length; i++){
        registradas += Number(onePage[i][5]) || 0;
        cerradas += Number(onePage[i][6]) || 0;
        abiertas += Number(onePage[i][7]) || 0;
        alta += Number(onePage[i][8]) || 0;
        media += Number(onePage[i][9]) || 0;
        baja += Number(onePage[i][10]) || 0;
    }
    let pendientes = 0;
    let revision = 0;
    let proceso = 0;
    // Definiciones pendientes
    definiciones.slice(1).forEach(fila => {
        const estatus =
            String(fila[5] || "")
                .trim()
                .toLowerCase();
        if(estatus === "pendiente"){
            pendientes++;
        }
        else if(
            estatus === "en revisión" ||
            estatus === "revision"
        ){
            revision++;
        }
        else if(
            estatus === "en proceso"
        ){
            proceso++;
        }
    });
    document.getElementById("mvp-total")
        .textContent = registradas;
    document.getElementById("defs-cerradas")
        .textContent =
        `${cerradas} cerradas`;
    document.getElementById("defs-abiertas")
        .textContent =
        `${abiertas} abiertas`;
    document.getElementById("mvp-pendientes")
        .textContent =
        `Pendientes: ${pendientes}`;
    document.getElementById("mvp-revision")
        .textContent =
        `En revisión: ${revision}`;
    document.getElementById("mvp-proceso")
        .textContent =
        `En proceso: ${proceso}`;
    document.getElementById("mvp-abiertas-prioridad")
        .textContent =
        abiertas;
    document.getElementById("mvp-alta")
        .textContent = alta;
    document.getElementById("mvp-media")
        .textContent = media;
    document.getElementById("mvp-baja")
        .textContent = baja;
const totalDefs =
    cerradas +
    pendientes +
    revision +
    proceso;

if(totalDefs > 0){

    const pCerradas =
        (cerradas / totalDefs) * 100;

    const pPendientes =
        (pendientes / totalDefs) * 100;

    const pRevision =
        (revision / totalDefs) * 100;

    const finCerradas =
        pCerradas;

    const finPendientes =
        finCerradas + pPendientes;

    const finRevision =
        finPendientes + pRevision;

    const barra =
        document.querySelector(".defs-fill");

    if(barra){

        barra.style.background = `
            linear-gradient(
                to right,

                #3f8a3a 0%,
                #3f8a3a ${finCerradas}%,

                #e75301 ${finCerradas}%,
                #e75301 ${finPendientes}%,

                #494d7d ${finPendientes}%,
                #494d7d ${finRevision}%,

                #bfc3c9 ${finRevision}%,
                #bfc3c9 100%
            )
        `;

    }
}
}
function actualizarRoadmap(){
    const inicio =
        new Date("2026-10-01");
    const fin =
        new Date("2027-01-25");
    const hoy =
        new Date();
    const totalDias =
        (fin - inicio) /
        (1000 * 60 * 60 * 24);
    const calcularPosicion = (fecha) => {
        const dias =
            (fecha - inicio) /
            (1000 * 60 * 60 * 24);
        return (
            4 +
            ((dias / totalDias) * 92)
        );
    };
    const hitos = [
        [".hito-fresh","2026-10-01"],
        [".hito-mesas","2026-10-08"],
        [".hito-kickoff","2026-10-19"],
        [".hito-camino","2026-11-03"],
        [".hito-sombra","2026-11-30"],
        [".hito-operacion","2026-12-28"],
        [".hito-fin","2027-01-25"]

    ];
    hitos.forEach(h => {
        const el =
            document.querySelector(h[0]);
        if(el){
            el.style.left =
                `${calcularPosicion(
                    new Date(h[1])
                )}%`;
        }
    });
    const posicionHoy =
        calcularPosicion(hoy);
    
    const marcador =
        document.getElementById(
            "roadmap-today"
        );
    
    if(marcador){
    
        marcador.style.left =
            `${posicionHoy}%`;
    
    }
    
    const progreso =
        document.querySelector(
            ".roadmap-progress"
        );
    
    if(progreso){
    
        progreso.style.width =
            `${posicionHoy - 4}%`;
    
    }
}

function renderResponsables(data){
    const hoja =
        data["Definiciones pendientes"];
    const select =
        document.getElementById(
            "responsable-select"
        );
    if(!hoja || !select){
        return;
    }
    const responsables = [
        ...new Set(
            hoja
                .slice(1)
                .map(fila => fila[2])
                .filter(Boolean)
        )
    ];
    select.innerHTML = `
        <option value="todos">
            Todos
        </option>
    `;
    responsables
        .sort()
        .forEach(nombre => {
            select.innerHTML += `
                <option
                    value="${nombre}">
                    ${nombre}
                </option>
            `;
        });
    select.addEventListener(
        "change",
        () => {
            responsableSeleccionado =
                select.value;
            actualizarDecisiones(
                window.dashboardData
            );
        }
    );
}

function actualizarFecha(){
    const hoy = new Date();
    const fecha =
        hoy.toLocaleDateString(
            "es-MX",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    const elemento =
        document.getElementById("fecha-hoy");
    if(elemento){
        elemento.textContent = fecha;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnImprimir =
        document.getElementById("btn-imprimir");
    if(btnImprimir){
        btnImprimir.addEventListener("click", () => {
            setTimeout(() => {
                window.print();
            }, 100);
        });
    }
});
window.addEventListener("beforeprint", () => {
    document.body.classList.add("printing");
});
window.addEventListener("afterprint", () => {
    document.body.classList.remove("printing");
});

function activarFiltrosMesas(){
    const botones =
        document.querySelectorAll(
            "#filtro-mesas .chip-btn"
        );
    botones.forEach(btn => {
        btn.addEventListener(
            "click",
            () => {
                botones.forEach(b => {
                    b.classList.remove(
                        "active"
                    );
                    b.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });
                btn.classList.add(
                    "active"
                );
                btn.setAttribute(
                    "aria-pressed",
                    "true"
                );
                mesaSeleccionada =
                    btn.dataset.mesa;
                actualizarDecisiones(
                    window.dashboardData
                );
            }
        );
    });
}

function actualizarSesiones(data){

    const hoja =
        data["Cadencia"];

    if(!hoja){
        return;
    }

    const cumplimiento =
        document.getElementById(
            "lista-cumplimiento"
        );

    const comercial =
        document.getElementById(
            "lista-comercial"
        );

    const tecnologia =
        document.getElementById(
            "lista-tecnologia"
        );

    if(
        !cumplimiento ||
        !comercial ||
        !tecnologia
    ){
        return;
    }

    cumplimiento.innerHTML = "";
    comercial.innerHTML = "";
    tecnologia.innerHTML = "";

    let totalCumplimiento = 0;
    let totalComercial = 0;
    let totalTecnologia = 0;

    hoja.slice(13).forEach(fila => {

        const tipo = fila[1];
        const fecha = fila[2];
        const mesa = fila[3];
        const grabacion = fila[4];
        const minuta = fila[5];

        const html = `

            <div class="sesion-item">

                <div class="sesion-fecha">
                    ${fecha}
                </div>

                <div class="sesion-titulo">
                    ${tipo}
                </div>

                <div class="sesion-links">

                    <a class="sesion-link"
                       href="${grabacion}"
                       target="_blank">
                        🎥 Grabación
                    </a>

                    <a class="sesion-link"
                       href="${minuta}"
                       target="_blank">
                        📝 Minuta
                    </a>

                </div>

            </div>

        `;

        if(
            String(mesa)
                .includes("Cumplimiento")
        ){

            totalCumplimiento++;
            cumplimiento.innerHTML += html;

        }
        else if(
            String(mesa)
                .includes("Estrategia")
        ){

            totalComercial++;
            comercial.innerHTML += html;

        }
        else if(
            String(mesa)
                .includes("Arquitectura")
        ){

            totalTecnologia++;
            tecnologia.innerHTML += html;

        }

    });

    document.getElementById(
        "resumen-cumplimiento"
    ).textContent = totalCumplimiento;

    document.getElementById(
        "resumen-comercial"
    ).textContent = totalComercial;

    document.getElementById(
        "resumen-tecnologia"
    ).textContent = totalTecnologia;

}

function actualizarDiasRestantes(){
    const fin =
        new Date("2027-01-25");
    const hoy =
        new Date();
    const dias =
        Math.max(
            0,
            Math.ceil(
                (fin - hoy) /
                (1000 * 60 * 60 * 24)
            )
        );
    const contador =
        document.getElementById(
            "dias-restantes"
        );
    if(contador){
        contador.textContent =
            dias;
    }
}
function actualizarPlanTrabajo(data){
    const hoja =
        data["Plan de trabajo"];
    const cuerpo =
        document.getElementById(
            "plan-trabajo-body"
        );
    if(!hoja || !cuerpo){
        return;
    }
    cuerpo.innerHTML = "";
    hoja.slice(1).forEach(fila => {
        const ciclo = fila[0];
        const semanas = fila[1];
        const etapa = fila[2];
        const objetivo = fila[3];
        const hito = fila[4];
        const lineas =
            String(hito || "")
                .split("\n");
        
        const tituloHito =
            lineas[0] || "";
        
        const detalleHito =
            lineas.slice(1);
        const estatus = fila[5];
        let clase = "programado";
        if(
            String(estatus)
                .toLowerCase()
                .includes("complet")
        ){
            clase = "completado";
        }
        else if(
            String(estatus)
                .toLowerCase()
                .includes("curso")
        ){
            clase = "curso";
        }
        cuerpo.innerHTML += `
        
            <tr>
        
                <td>
                    ${ciclo}
                </td>
        
                <td>
                    ${semanas}
                </td>
        
                <td>
                    ${etapa}
                </td>
        
                <td>
                    ${objetivo}
                </td>
        
                <td>
        
                    <div class="hito-principal">
                        ${tituloHito}
                    </div>
        
                    <ul class="hito-detalle">
        
                        ${detalleHito.map(item => `
                            <li>
                                ${item.replace(/^- /,'')}
                            </li>
                        `).join("")}
        
                    </ul>
        
                </td>
        
                <td>
        
                    <span
                        class="plan-status ${clase}">
                        ${estatus}
                    </span>
        
                </td>
        
            </tr>
        
        `;
    });
}
