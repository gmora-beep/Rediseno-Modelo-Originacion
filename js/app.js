async function cargarDashboard(data){
    window.dashboardData = data;
    actualizarHero(data);
    actualizarMesas(data);
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
    const definiciones =
        data["Definiciones pendientes"];
    const contenedor =
        document.getElementById("decisiones");
    if(!definiciones || !contenedor){
        return;
    }
    contenedor.innerHTML = "";
    definiciones.slice(1).forEach(fila => {
        const texto = fila[1];     // Columna B
        const prioridad = fila[6]; // Columna G
        const estatus = fila[5];   // Columna F
        if(
            String(estatus)
            .trim()
            .toLowerCase() === "cerrado"
        ){
            return;
        }
        let clase = "level--medio";
        if(
            String(prioridad)
            .toLowerCase()
            .includes("alta")
        ){
            clase = "level--alto";
        }
        contenedor.innerHTML += `
            <li>
                <div class="decision__head">
                    <p class="decision__title">
                        ${texto}
                    </p>
                    <span class="level ${clase}">
                        ${prioridad}
                    </span>
                </div>
            </li>
        `;
    });
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
    document.getElementById("contenido-vista").innerHTML =
        html;
}
