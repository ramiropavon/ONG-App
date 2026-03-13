/**
 * Cliente para interactuar con la API de Pulse Pro.
 * Implementa los endpoints descritos en la documentación de Swagger.
 */
export class PulseClient {
  /**
   * @param {string} apiKey - Tu API Key de Pulse (usualmente x-api-key)
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("Pulse API Key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://api.pulsegrow.com";
  }

  /**
   * Helper para realizar las peticiones a la API
   * @private
   */
  async _fetchApi(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "x-api-key": this.apiKey,
        "Accept": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Pulse API Error: Unauthorized (401)");
      }
      let errorMessage = `Pulse API Error ${response.status}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage += `: ${errorBody}`;
        }
      } catch (e) {
        // Ignorar error al leer el body
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Gets all of the grows devices, including latest data.
   * @returns {Promise<any>}
   */
  async getAllDevices() {
    return this._fetchApi("/all-devices");
  }

  /**
   * Gets the last data point for a device
   * @param {number} deviceId 
   * @returns {Promise<any>}
   */
  async getDeviceRecentData(deviceId) {
    return this._fetchApi(`/devices/${deviceId}/recent-data`);
  }

  /**
   * Retrieves all datapoints within a specified timespan for the device.
   * @param {number} deviceId 
   * @param {string} start - ISO 8601 string, e.g. "2020-01-31T01:11:22Z"
   * @param {string} [end] - ISO 8601 string. Optional.
   * @returns {Promise<any[]>}
   */
  async getDeviceDataRange(deviceId, start, end) {
    const url = new URL(`${this.baseUrl}/devices/${deviceId}/data-range`);
    url.searchParams.append("start", start);
    if (end) {
      url.searchParams.append("end", end);
    }
    return this._fetchApi(`${url.pathname}${url.search}`);
  }

  /**
   * Gets the last data point for a sensor
   * @param {number} sensorId 
   * @returns {Promise<any>}
   */
  async getSensorRecentData(sensorId) {
    return this._fetchApi(`/sensors/${sensorId}/recent-data`);
  }

  /**
   * Data Range for Sensor.
   * @param {number} sensorId 
   * @param {string} start - ISO 8601 string
   * @param {string} [end] - ISO 8601 string. Optional.
   * @returns {Promise<any[]>}
   */
  async getSensorDataRange(sensorId, start, end) {
    const url = new URL(`${this.baseUrl}/sensors/${sensorId}/data-range`);
    url.searchParams.append("start", start);
    if (end) {
      url.searchParams.append("end", end);
    }
    return this._fetchApi(`${url.pathname}${url.search}`);
  }

  /**
   * Force an immediate sensor reading
   * @param {number} sensorId 
   * @returns {Promise<any>}
   */
  async forceSensorRead(sensorId) {
    return this._fetchApi(`/sensors/${sensorId}/force-read`);
  }
}
