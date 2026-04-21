import { render, screen } from '@testing-library/react';
import AuthNode from './AuthNode';
import { vi } from 'vitest';

// 1. EL MOCK (Ignoremos esto por ahora, es solo para que no explote React Flow)
vi.mock('reactflow', () => ({
    Handle: () => <div></div>,
    Position: { Left: 'left', Right: 'right' }
}));

// 2. EL DESCRIBE (La caja grande)
describe('Nodo de autenticación: Pruebas de AuthNode', () => {

    // 3. EL IT (La prueba individual)
    it('Debe decir "Control de Accesos" en la pantalla', () => {

        // A. PREPARACIÓN (Renderizar)
        render(<AuthNode data={{}} selected={false} />);

        // B. AFIRMACIÓN (Expect)
        expect(screen.getByText('Control de Accesos')).toBeInTheDocument();

    });

});
