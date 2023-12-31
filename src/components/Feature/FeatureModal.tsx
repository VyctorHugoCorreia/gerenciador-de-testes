import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TeamsDropDown from '../Dropdown/TeamsDropDown';
import FeatureService from '../../services/FeatureService';
import ProductDropDown from '../Dropdown/ProductDropDown';
import TextField from '@mui/material/TextField';
import ProductService from '../../services/ProductService';
import Toast from '../Toast';

export interface Product {
  idTproduto: number;
  descProduto: string;
  idTime: {
    idTime: number;
    nomeTime: string;
  };
}

export interface Feature {
  id: number;
  name: string;
  idTime: {
    idTime: number;
    nomeTime: string;
  };
}

export interface FeatureModalProps {
  open: boolean;
  onClose: () => void;
  fetchFeatures: () => void;
  selectedFeature?: {
    id: number;
    name: string;
    idTime: { idTime: number; nomeTime: string };
    idTproduto: { idTproduto: number; descProduto: string }
  } | null;
}

const FeatureModal: React.FC<FeatureModalProps> = ({
  open,
  onClose,
  fetchFeatures,
  selectedFeature,
}) => {
  const [error, setError] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [featureName, setFeatureName] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<{
    idTime: number;
    nomeTime: string;
  } | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [resetProductDropdown, setResetProductDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false); 

  useEffect(() => {
    if (open && selectedFeature) {
      setError('');
      setIsButtonDisabled(!selectedFeature.name);
      setFeatureName(selectedFeature.name || '');
      setSelectedTeam(selectedFeature.idTime || null);
      setSelectedTeamId(selectedFeature.idTime?.idTime || null);
      setSelectedProductId(null);
    } else {
      setError('');
      setIsButtonDisabled(true);
      setFeatureName('');
      setSelectedTeam(null);
      setSelectedTeamId(null);
      setSelectedProductId(null);
    }
  }, [open, selectedFeature]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeatureName(event.target.value);
    setError('');
    setIsButtonDisabled(event.target.value === '');
  };

  const handleSelectTeam = async (team: { idTime: number; nomeTime: string } | string) => {
    if (!selectedFeature) {
      if (typeof team === 'string') {
        setIsButtonDisabled(true);
        setSelectedTeam(null);
        setSelectedTeamId(null);
        setSelectedProductId(null);
        setProducts([]);
        setResetProductDropdown(true);
      } else {
        setError('');
        setIsButtonDisabled(false);
        setSelectedTeam(team);
        setSelectedTeamId(team.idTime);
        setSelectedProductId(null);
        setResetProductDropdown(false);

        try {
          const productsData = await ProductService.getProductsByTeam(team.idTime.toString());
          setProducts(productsData);
        } catch (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
        }
      }
    }
  };

  const handleAddFeature = async () => {
    try {
      if (selectedTeam && selectedProductId !== null) {
        await FeatureService.addFeature(selectedTeam.idTime, selectedProductId, featureName);
        setFeatureName('');
        setSelectedTeam(null);
        setSelectedTeamId(null);
        setSelectedProductId(null);
        onClose();
        fetchFeatures();
        setShowToast(true);
      } else {
        setError('Selecione um time e um produto');
      }
    } catch (err) {
      setError(`${err}`);
    }
  };

  const handleEditFeature = async () => {
    try {
      if (selectedTeam && selectedFeature) {
        await FeatureService.editFeature(selectedFeature.id, selectedFeature.idTime.idTime, selectedFeature.idTproduto.idTproduto, featureName);
        setFeatureName('');
        setSelectedTeam(null);
        setSelectedTeamId(null);
        onClose();
        fetchFeatures();
        setShowToast(true);
      } else {
        setError('Selecione um time');
      }
    } catch (err) {
      setError(`${err}`);
    }
  };

  const isEditing = !!selectedFeature;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="team-modal-title"
        aria-describedby="team-modal-description"
      >
        <div className="team-modal">
          <h2 id="team-modal-title">
            {selectedFeature ? 'Editar funcionalidade' : 'Adicionar nova funcionalidade'}
          </h2>
          <TeamsDropDown
            onSelectTeam={handleSelectTeam}
            selectedTeam={selectedTeam?.idTime || null}
            disabled={isEditing}
          />

          <ProductDropDown
            onSelectProduct={(selectedProductId) => {
              setSelectedProductId(selectedProductId);
            }}
            selectedTeamId={selectedTeamId}
            disabled={isEditing}
            isEditing={isEditing}
            resetDropdown={resetProductDropdown}
            selectedProductId={selectedFeature?.idTproduto.idTproduto || null} 
          />

          <TextField
            className="team-modal-input"
            id="feature-name"
            placeholder="Preencha o nome da funcionalidade"
            value={featureName}
            onChange={handleInputChange}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button
            className="team-modal-button"
            variant="contained"
            color="primary"
            onClick={selectedFeature ? handleEditFeature : handleAddFeature}
            disabled={isButtonDisabled}
          >
            {selectedFeature ? 'Editar' : 'Cadastrar'}
          </Button>
        </div>
      </Modal>

      {showToast && (
        <div>
          <Toast
            message="Operação realizada com sucesso!"
            showToast={showToast}
            setShowToast={setShowToast}
          />
        </div>
      )}
    </>
  );

};

export default FeatureModal;
