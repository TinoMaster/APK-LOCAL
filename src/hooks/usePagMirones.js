import { useEffect, useState } from "react";
import { httpHelper } from "../helpers/httpHelper";
import apiConfig from "../config/api.config.json";

const usePagMirones = () => {
  const [mirones, setMirones] = useState([]);
  const [loaderPageMiron, setLoaderPageMiron] = useState(false);
  const [errorPageMiron, setErrorPageMiron] = useState({});
  const [successPageMiron, setSuccessPageMiron] = useState({});
  const [dispositivos, setDispositivos] = useState([]);

  const [searchDisp, setSearchDisp] = useState("");

  useEffect(() => {
    setLoaderPageMiron(true);
    httpHelper()
      .get(`${apiConfig.api.url}/mirones`)
      .then(async (res) => {
        if (res.error) {
          setLoaderPageMiron(false);
          setErrorPageMiron(res);
        } else {
          await setMirones(res.data);
          ArrayDispositivos(res.data);
          setLoaderPageMiron(false);
        }
      });
  }, []);

 

  const mejoresDiasSemana = (bd) => {
    let result = {};

    result = bd?.reduce((objectResult, element) => {
      if (!objectResult[element.fecha.split(" ")[0]]) {
        objectResult[element.fecha.split(" ")[0]] = element.venta_total;
      } else objectResult[element.fecha.split(" ")[0]] += element.venta_total;
      return result;
    }, result);

    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  };

  const dispositivosMasCopian = (bd) => {
    let result = {};
    result = bd?.reduce((objectResult, elementoutside) => {
      elementoutside?.dispositivos?.forEach((element) => {
        if (!objectResult[element.dispositivo]) {
          objectResult[element.dispositivo] = element.pago;
        } else objectResult[element.dispositivo] += element.pago;
      });
      return result;
    }, result);
    return Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const ArrayDispositivos = async (bd) => {
    let result = {};
    result = await bd?.reduce((objectResult, elementoutside) => {
      elementoutside?.dispositivos?.forEach(async (element) => {
        if (!objectResult[element.dispositivo]) {
          objectResult[element.dispositivo] = {
            fechas: [elementoutside.fecha],
            cont: 1,
            pago: element.pago,
          };
        } else {
          const existDate = await objectResult[
            element.dispositivo
          ]?.fechas?.includes(elementoutside.fecha);
          if (!existDate) {
            objectResult[element.dispositivo].cont += 1;
            objectResult[element.dispositivo].fechas = [
              ...objectResult[element.dispositivo].fechas,
              elementoutside.fecha,
            ];
          }
          objectResult[element.dispositivo].pago += element.pago;
        }
      });
      return objectResult;
    }, {});
    console.log(Object.entries(result).sort((a, b) => b[1].pago - a[1].pago));
    setDispositivos(
      Object.entries(result).sort((a, b) => b[1].pago - a[1].pago)
    );
  };

  const states = {
    mirones,
    setMirones,
    loaderPageMiron,
    errorPageMiron,
    successPageMiron,
    dispositivos,
  };
  const functions = {
    mejoresDiasSemana,
    dispositivosMasCopian,
    ArrayDispositivos,
  };
  return { states, functions };
};

export { usePagMirones };
