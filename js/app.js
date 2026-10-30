async function cargarDashboard(data){
    window.dashboardData = data;
    actualizarHero(data);
    actualizarMesas(data);
    actualizarResumenDecisiones(data);
    await cargarVista("views/decisiones.html");
    actualizarDecisiones(data);
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
        document.getElementById("lista-pendientes");
    const realizadas =
        document.getElementById("lista-realizadas");
    const totalPendientes =
        document.getElementById("dec-pendientes");
    const totalRealizadas =
        document.getElementById("dec-realizadas");
    if(
        !pendientes ||
        !realizadas
    ){
        return;
    }
    pendientes.innerHTML = "";
    realizadas.innerHTML = "";
    let contadorPendientes = 0;
    let contadorRealizadas = 0;
    hoja.slice(1).forEach(fila => {
        const texto = fila[1];
        const responsable = fila[2];
        const mesa = fila[3];
        const fecha = fila[4];
        const estatus = fila[5];
        const prioridad = fila[6];
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
                <span class="status">
                    ${prioridad}
                </span>
            </li>
        `;
        if(
            String(estatus)
                .trim()
                .toLowerCase() === "cerrado"
        ){
            realizadas.innerHTML += tarjeta;
            contadorRealizadas++;
        }else{
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
    // Comercial
    document.getElementById("comercial-sesiones").textContent = onePage[2][2];
    document.getElementById("comercial-fecha").textContent = onePage[2][4];
    document.getElementById("comercial-registradas").textContent = onePage[2][5];
    document.getElementById("comercial-cerradas").textContent = onePage[2][6];
    document.getElementById("comercial-abiertas").textContent = onePage[2][7];
    // Tecnología
    document.getElementById("tecnologia-sesiones").textContent = onePage[3][2];
    document.getElementById("tecnologia-fecha").textContent = onePage[3][4];
    document.getElementById("tecnologia-registradas").textContent = onePage[3][5];
    document.getElementById("tecnologia-cerradas").textContent = onePage[3][6];
    document.getElementById("tecnologia-abiertas").textContent = onePage[3][7];
}

async function cargarVista(ruta){
    const response = await fetch(ruta);
    const html = await response.text();
    document.getElementById("contenido-decisiones").innerHTML = html;
}

let decisionesCargadas = false;
document.addEventListener("DOMContentLoaded", () => {
    const tabTablero =
        document.getElementById("tab-tablero");
    const tabDecisiones =
        document.getElementById("tab-actividades");
    const panelTablero =
        document.getElementById("panel-tablero");
    const panelDecisiones =
        document.getElementById("panel-actividades");
    tabDecisiones.addEventListener("click", async () => {
        panelTablero.hidden = true;
        panelDecisiones.hidden = false;
        tabTablero.setAttribute(
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
            decisionesCargadas = true;
        }
    });
    tabTablero.addEventListener("click", () => {
        panelTablero.hidden = false;
        panelDecisiones.hidden = true;
        tabTablero.setAttribute(
            "aria-selected",
            "true"
        );
        tabDecisiones.setAttribute(
            "aria-selected",
            "false"
        );
    });
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
        })
        .slice(0,10);
    pendientes.forEach(fila => {
        contenedor.innerHTML += `
            <li>
                <div class="decision__head">
                    <p class="decision__title">
                        ${fila[1]}
                    </p>
                    <span class="level">
                        ${fila[6]}
                    </span>
                </div>
            </li>
        `;
    });
}
