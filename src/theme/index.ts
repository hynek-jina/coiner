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
  border-radius: 5px;
  flex: 1;
  color: ${colors.buttonText};
  font-weight: bold;
  text-align: center;
  cursor: pointer;
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
  // text-color: ${colors.primary}
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

export const BubbleChartTitle = styled.h1`
  font-size: 2rem;
  color: #34acb9;
  margin: 0;
  // margin-bottom: 1rem;
`;

export const BubbleChartSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.3);
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
