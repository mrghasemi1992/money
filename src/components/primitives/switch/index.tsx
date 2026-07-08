import * as RadixSwitch from '@radix-ui/react-switch';
import styles from './styles.module.css';

export interface SwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ label, ...props }: SwitchProps) {
  return (
    <RadixSwitch.Root className={styles.root} aria-label={label} {...props}>
      <RadixSwitch.Thumb className={styles.thumb} />
    </RadixSwitch.Root>
  );
}
