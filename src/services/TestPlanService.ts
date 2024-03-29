import axios, { AxiosError } from 'axios';
import { getAuthToken } from '../authentication/token'; 

const BASE_URL = 'http://localhost:8080';

interface SearchParams {
  descPlano?: string;
  idTime?: number;
  idTproduto?: number;
}

class TestPlanService {
  static async getAllTestPlan(): Promise<any> {
    return this.request('get', '/api/planoDeTeste');
  }

  static async addTestPlan(idTime: number, idTproduto: number, descPlano: string): Promise<any> {
    const data = {
      idTime,
      idTproduto,
      descPlano,
    };

    return this.request('post', '/api/planoDeTeste', data);
  }

  static async editTestPlan(idPlano: number, idTime: number, idTproduto: number, descPlano: string): Promise<any> {
    const url = `/api/planoDeTeste/${idPlano}`;

    const requestBody = {
      idTime,
      idTproduto,
      descPlano,
    };

    return this.request('put', url, requestBody);
  }

  static async deleteTestPlan(idPlano: number): Promise<void> {
    return this.request('delete', `/api/planoDeTeste/${idPlano}`);
  }

  static async getTestPlansByProduct(searchValue?: string): Promise<any> {
    return this.request('get', `/api/planoDeTeste`, undefined, { idTproduto: searchValue });
  }

  static async getTestPlansById(searchValue?: string): Promise<any> {
    return this.request('get', `/api/planoDeTeste`, undefined, { idPlano: searchValue });
  }

  static async getTestPlansByTeam(searchValue?: string): Promise<any> {
    return this.request('get', `/api/planoDeTeste`, undefined, { idTime: searchValue });
  }

  static async searchTestPlan(params: SearchParams = {}): Promise<any> {
    const { descPlano, idTime, idTproduto } = params;
    const url = '/api/planoDeTeste';

    const requestParams: Record<string, any> = {
      idTime,
      idTproduto
    };

    if (descPlano !== undefined && descPlano.trim() !== "") {
      requestParams.descPlano = descPlano;
    }

    return this.request('get', url, undefined, requestParams);
  }



  private static async request(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any, params?: any): Promise<any> {
    try {
      const config: Record<string, any> = {
        method,
        url: `${BASE_URL}${url}`,
        headers: {
          Authorization: `Bearer ${getAuthToken()}` 
        }
      };

      if (data && method !== 'get') {
        config.data = data;
      }

      if (params && method === 'get') {
        config.params = params;
      }

      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw axiosError.response?.data ?? axiosError.message;
      } else {
        throw error;
      }
    }
  }
}

export default TestPlanService;
