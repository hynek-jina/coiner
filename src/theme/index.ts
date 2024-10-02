import styled from "styled-components";
import { colors } from "./colors";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 20px;
  flex: 1;
`;

export const Button = styled.button<{ disabled?: boolean }>`
  margin: 20px 0;
  padding: 10px;
  background-color: ${({ disabled }) =>
    disabled ? colors.disabled : colors.primary};
  border-radius: 12px;
  flex: 1;
  color: ${colors.buttonText};
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  border: none;
  shadow: none;
  width: 280px;
`;

export const SecondaryButton = styled(Button)`
  background-color: ${colors.secondary};
`;

export const ButtonText = styled.span`
  color: ${colors.buttonText};
  font-weight: bold;
  text-align: center;
`;

export const ButtonLink = styled(Button)`
  color: ${colors.textSecondary};
  background-color: transparent;
  border: none;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  font-weight: normal;

  &:hover {
    text-decoration: underline;
  }
`;

export const BubbleChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "Arial", sans-serif;
  font-weight: ;
`;

export const AppName = styled.h1`
  font-size: 1.4rem;
  color: ${colors.textHeader};
`;

export const BubbleChartTitle = styled.h1`
  font-size: 2rem;
  color: #34acb9;
  margin: 0;
  // margin-bottom: 1rem;
`;

export const BubbleChartSubtitle = styled.p`
  font-size: 1rem;
  color: ${colors.textSecondary};
`;

export const BubbleChartSvg = styled.svg`
  /* Removed border */
`;

export const Bubble = styled.circle`
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

export const BubbleText = styled.text`
  font-size: 0.8rem;
  pointer-events: none;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 800px;
  align-items: left;
  justify-content: center;
  margin: 0 auto;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 20rem;
`;
