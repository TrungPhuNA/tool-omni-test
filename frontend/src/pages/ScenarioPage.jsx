import React from 'react';
import useStore from '../store/useStore';
import ScenarioRunner from '../components/features/scenarios/ScenarioRunner';
import { useParams } from 'react-router-dom';

const ScenarioPage = () => {
    const { id } = useParams();
    const { 
        activeScenario, 
        collections, 
        activeEnvironment 
    } = useStore();

    // Find scenario by ID if not active in store
    const scenario = activeScenario || collections.flatMap(c => c.scenarios || []).find(s => s.id == id);

    if (!scenario) {
        return (
            <div className="flex-1 flex items-center justify-center text-dark-500 italic">
                Kịch bản không tồn tại hoặc hãy chọn từ Sidebar.
            </div>
        );
    }

    return (
        <ScenarioRunner 
            scenario={scenario} 
            collections={collections}
            activeEnvironment={activeEnvironment}
            showToast={() => {}} // Could pass from layout if needed
        />
    );
};

export default ScenarioPage;
