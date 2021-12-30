import {
  FormControlLabel,
  Switch,
  makeStyles,
  type SwitchProps,
} from '@material-ui/core';
import clsx from 'clsx';
import { useCallback, type FC } from 'react';
import ControlLabel from '../control-label';

interface CustomDefaultSwitchProps {
  className?: string;
  onChange: (value: boolean) => void;
  value: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: 'fit-content',
    margin: theme.spacing(0),
  },
  control: {
    marginTop: -1,
    marginBottom: -1,
  },
  label: {
    width: 50,
    marginRight: theme.spacing(1.5),
  },
}));

const CustomDefaultSwitch: FC<CustomDefaultSwitchProps> = (props) => {
  const { className, onChange, value } = props;
  const classes = useStyles();
  const handleChange = useCallback<NonNullable<SwitchProps['onChange']>>(
    (event, checked) => {
      onChange(checked);
    },
    [onChange],
  );
  const control = (
    <Switch
      checked={value}
      className={classes.control}
      color={'primary'}
      onChange={handleChange}
    />
  );
  const label = (
    <ControlLabel
      className={classes.label}
      value={value ? 'Default' : 'Custom'}
      variant={'body2'}
    />
  );
  return (
    <FormControlLabel
      className={clsx(classes.root, className)}
      control={control}
      label={label}
    />
  );
};

export { CustomDefaultSwitch as default };
