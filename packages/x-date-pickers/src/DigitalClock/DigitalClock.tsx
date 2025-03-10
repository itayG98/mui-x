import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useSlotProps } from '@mui/base/utils';
import { alpha, styled, useThemeProps } from '@mui/material/styles';
import useEventCallback from '@mui/utils/useEventCallback';
import composeClasses from '@mui/utils/composeClasses';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import useForkRef from '@mui/utils/useForkRef';
import { useUtils, useNow, useLocaleText } from '../internals/hooks/useUtils';
import { createIsAfterIgnoreDatePart } from '../internals/utils/time-utils';
import { PickerViewRoot } from '../internals/components/PickerViewRoot';
import { getDigitalClockUtilityClass } from './digitalClockClasses';
import { DigitalClockProps } from './DigitalClock.types';
import { useViews } from '../internals/hooks/useViews';
import { TimeView } from '../models';
import { DIGITAL_CLOCK_VIEW_HEIGHT } from '../internals/constants/dimensions';
import { useControlledValueWithTimezone } from '../internals/hooks/useValueWithTimezone';
import { singleItemValueManager } from '../internals/utils/valueManagers';
import { useClockReferenceDate } from '../internals/hooks/useClockReferenceDate';

const useUtilityClasses = (ownerState: DigitalClockProps<any>) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    list: ['list'],
    item: ['item'],
  };

  return composeClasses(slots, getDigitalClockUtilityClass, classes);
};

const DigitalClockRoot = styled(PickerViewRoot, {
  name: 'MuiDigitalClock',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: DigitalClockProps<any> & { alreadyRendered: boolean } }>(({ ownerState }) => ({
  overflowY: 'auto',
  width: '100%',
  scrollBehavior: ownerState.alreadyRendered ? 'smooth' : 'auto',
  maxHeight: DIGITAL_CLOCK_VIEW_HEIGHT,
}));

const DigitalClockList = styled(MenuList, {
  name: 'MuiDigitalClock',
  slot: 'List',
  overridesResolver: (props, styles) => styles.list,
})({
  padding: 0,
});

const DigitalClockItem = styled(MenuItem, {
  name: 'MuiDigitalClock',
  slot: 'Item',
  overridesResolver: (props, styles) => styles.item,
})(({ theme }) => ({
  padding: '8px 16px',
  margin: '2px 4px',
  '&:first-of-type': {
    marginTop: 4,
  },
  '&:hover': {
    backgroundColor: theme.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.hoverOpacity})`
      : alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
  },
  '&.Mui-selected': {
    backgroundColor: (theme.vars || theme).palette.primary.main,
    color: (theme.vars || theme).palette.primary.contrastText,
    '&:focus-visible, &:hover': {
      backgroundColor: (theme.vars || theme).palette.primary.dark,
    },
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.focusOpacity})`
      : alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
  },
}));

type DigitalClockComponent = (<TDate>(
  props: DigitalClockProps<TDate> & React.RefAttributes<HTMLDivElement>,
) => JSX.Element) & { propTypes?: any };

export const DigitalClock = React.forwardRef(function DigitalClock<TDate extends unknown>(
  inProps: DigitalClockProps<TDate>,
  ref: React.Ref<HTMLDivElement>,
) {
  const utils = useUtils<TDate>();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, containerRef);

  const props = useThemeProps({
    props: inProps,
    name: 'MuiDigitalClock',
  });

  const {
    ampm = utils.is12HourCycleInCurrentLocale(),
    timeStep = 30,
    autoFocus,
    components,
    componentsProps,
    slots,
    slotProps,
    value: valueProp,
    defaultValue,
    referenceDate: referenceDateProp,
    disableIgnoringDatePartForTimeValidation = false,
    maxTime,
    minTime,
    disableFuture,
    disablePast,
    minutesStep = 1,
    shouldDisableClock,
    shouldDisableTime,
    onChange,
    view: inView,
    openTo,
    onViewChange,
    focusedView,
    onFocusedViewChange,
    className,
    disabled,
    readOnly,
    views = ['hours'],
    skipDisabled = false,
    timezone: timezoneProp,
    ...other
  } = props;

  const {
    value,
    handleValueChange: handleRawValueChange,
    timezone,
  } = useControlledValueWithTimezone({
    name: 'DigitalClock',
    timezone: timezoneProp,
    value: valueProp,
    defaultValue,
    onChange,
    valueManager: singleItemValueManager,
  });

  const localeText = useLocaleText<TDate>();
  const now = useNow<TDate>(timezone);

  const ownerState = React.useMemo(
    () => ({ ...props, alreadyRendered: !!containerRef.current }),
    [props],
  );

  const classes = useUtilityClasses(ownerState);

  const ClockItem = slots?.digitalClockItem ?? components?.DigitalClockItem ?? DigitalClockItem;
  const clockItemProps = useSlotProps({
    elementType: ClockItem,
    externalSlotProps: slotProps?.digitalClockItem ?? componentsProps?.digitalClockItem,
    ownerState: {},
    className: classes.item,
  });

  const valueOrReferenceDate = useClockReferenceDate({
    value,
    referenceDate: referenceDateProp,
    utils,
    props,
    timezone,
  });

  const handleValueChange = useEventCallback((newValue: TDate | null) =>
    handleRawValueChange(newValue, 'finish'),
  );

  const { setValueAndGoToNextView } = useViews<TDate | null, Extract<TimeView, 'hours'>>({
    view: inView,
    views,
    openTo,
    onViewChange,
    onChange: handleValueChange,
    focusedView,
    onFocusedViewChange,
  });

  const handleItemSelect = useEventCallback((newValue: TDate | null) => {
    setValueAndGoToNextView(newValue, 'finish');
  });

  React.useEffect(() => {
    if (containerRef.current === null) {
      return;
    }
    const selectedItem = containerRef.current.querySelector<HTMLElement>(
      '[role="listbox"] [role="option"][aria-selected="true"]',
    );

    if (!selectedItem) {
      return;
    }
    const offsetTop = selectedItem.offsetTop;

    // Subtracting the 4px of extra margin intended for the first visible section item
    containerRef.current.scrollTop = offsetTop - 4;
  });

  const isTimeDisabled = React.useCallback(
    (valueToCheck: TDate) => {
      const isAfter = createIsAfterIgnoreDatePart(disableIgnoringDatePartForTimeValidation, utils);

      const containsValidTime = () => {
        if (minTime && isAfter(minTime, valueToCheck)) {
          return false;
        }

        if (maxTime && isAfter(valueToCheck, maxTime)) {
          return false;
        }

        if (disableFuture && isAfter(valueToCheck, now)) {
          return false;
        }

        if (disablePast && isAfter(now, valueToCheck)) {
          return false;
        }

        return true;
      };

      const isValidValue = () => {
        if (utils.getMinutes(valueToCheck) % minutesStep !== 0) {
          return false;
        }

        if (shouldDisableClock?.(utils.toJsDate(valueToCheck).getTime(), 'hours')) {
          return false;
        }

        if (shouldDisableTime) {
          return !shouldDisableTime(valueToCheck, 'hours');
        }

        return true;
      };

      return !containsValidTime() || !isValidValue();
    },
    [
      disableIgnoringDatePartForTimeValidation,
      utils,
      minTime,
      maxTime,
      disableFuture,
      now,
      disablePast,
      minutesStep,
      shouldDisableClock,
      shouldDisableTime,
    ],
  );

  const timeOptions = React.useMemo(() => {
    const startOfDay = utils.startOfDay(valueOrReferenceDate);
    return [
      startOfDay,
      ...Array.from({ length: Math.ceil((24 * 60) / timeStep) - 1 }, (_, index) =>
        utils.addMinutes(startOfDay, timeStep * (index + 1)),
      ),
    ];
  }, [valueOrReferenceDate, timeStep, utils]);

  return (
    <DigitalClockRoot
      ref={handleRef}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      {...other}
    >
      <DigitalClockList
        autoFocusItem={autoFocus || !!focusedView}
        role="listbox"
        aria-label={localeText.timePickerToolbarTitle}
        className={classes.list}
      >
        {timeOptions.map((option) => {
          if (skipDisabled && isTimeDisabled(option)) {
            return null;
          }
          const isSelected = utils.isEqual(option, value);
          return (
            <ClockItem
              key={utils.toISO(option)}
              onClick={() => !readOnly && handleItemSelect(option)}
              selected={isSelected}
              disabled={disabled || isTimeDisabled(option)}
              disableRipple={readOnly}
              role="option"
              // aria-readonly is not supported here and does not have any effect
              aria-disabled={readOnly}
              aria-selected={isSelected}
              {...clockItemProps}
            >
              {utils.format(option, ampm ? 'fullTime12h' : 'fullTime24h')}
            </ClockItem>
          );
        })}
      </DigitalClockList>
    </DigitalClockRoot>
  );
}) as DigitalClockComponent;

DigitalClock.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * 12h/24h view for hour selection clock.
   * @default `utils.is12HourCycleInCurrentLocale()`
   */
  ampm: PropTypes.bool,
  /**
   * If `true`, the main element is focused during the first mount.
   * This main element is:
   * - the element chosen by the visible view if any (i.e: the selected day on the `day` view).
   * - the `input` element if there is a field rendered.
   */
  autoFocus: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * Overrideable components.
   * @default {}
   * @deprecated Please use `slots`.
   */
  components: PropTypes.object,
  /**
   * The props used for each component slot.
   * @default {}
   * @deprecated Please use `slotProps`.
   */
  componentsProps: PropTypes.object,
  /**
   * The default selected value.
   * Used when the component is not controlled.
   */
  defaultValue: PropTypes.any,
  /**
   * If `true`, the picker views and text field are disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, disable values after the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disableFuture: PropTypes.bool,
  /**
   * Do not ignore date part when validating min/max time.
   * @default false
   */
  disableIgnoringDatePartForTimeValidation: PropTypes.bool,
  /**
   * If `true`, disable values before the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disablePast: PropTypes.bool,
  /**
   * Controlled focused view.
   */
  focusedView: PropTypes.oneOf(['hours']),
  /**
   * Maximal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  maxTime: PropTypes.any,
  /**
   * Minimal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  minTime: PropTypes.any,
  /**
   * Step over minutes.
   * @default 1
   */
  minutesStep: PropTypes.number,
  /**
   * Callback fired when the value changes.
   * @template TDate, TView
   * @param {TDate | null} value The new value.
   * @param {PickerSelectionState | undefined} selectionState Indicates if the date selection is complete.
   * @param {TView | undefined} selectedView Indicates the view in which the selection has been made.
   */
  onChange: PropTypes.func,
  /**
   * Callback fired on focused view change.
   * @template TView
   * @param {TView} view The new view to focus or not.
   * @param {boolean} hasFocus `true` if the view should be focused.
   */
  onFocusedViewChange: PropTypes.func,
  /**
   * Callback fired on view change.
   * @template TView
   * @param {TView} view The new view.
   */
  onViewChange: PropTypes.func,
  /**
   * The default visible view.
   * Used when the component view is not controlled.
   * Must be a valid option from `views` list.
   */
  openTo: PropTypes.oneOf(['hours']),
  /**
   * If `true`, the picker views and text field are read-only.
   * @default false
   */
  readOnly: PropTypes.bool,
  /**
   * The date used to generate the new value when both `value` and `defaultValue` are empty.
   * @default The closest valid time using the validation props, except callbacks such as `shouldDisableTime`.
   */
  referenceDate: PropTypes.any,
  /**
   * Disable specific clock time.
   * @param {number} clockValue The value to check.
   * @param {TimeView} view The clock type of the timeValue.
   * @returns {boolean} If `true` the time will be disabled.
   * @deprecated Consider using `shouldDisableTime`.
   */
  shouldDisableClock: PropTypes.func,
  /**
   * Disable specific time.
   * @template TDate
   * @param {TDate} value The value to check.
   * @param {TimeView} view The clock type of the timeValue.
   * @returns {boolean} If `true` the time will be disabled.
   */
  shouldDisableTime: PropTypes.func,
  /**
   * If `true`, disabled digital clock items will not be rendered.
   * @default false
   */
  skipDisabled: PropTypes.bool,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overrideable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The time steps between two time options.
   * For example, if `timeStep = 45`, then the available time options will be `[00:00, 00:45, 01:30, 02:15, 03:00, etc.]`.
   * @default 30
   */
  timeStep: PropTypes.number,
  /**
   * Choose which timezone to use for the value.
   * Example: "default", "system", "UTC", "America/New_York".
   * If you pass values from other timezones to some props, they will be converted to this timezone before being used.
   * @see See the {@link https://mui.com/x/react-date-pickers/timezone/ timezones documention} for more details.
   * @default The timezone of the `value` or `defaultValue` prop is defined, 'default' otherwise.
   */
  timezone: PropTypes.string,
  /**
   * The selected value.
   * Used when the component is controlled.
   */
  value: PropTypes.any,
  /**
   * The visible view.
   * Used when the component view is controlled.
   * Must be a valid option from `views` list.
   */
  view: PropTypes.oneOf(['hours']),
  /**
   * Available views.
   */
  views: PropTypes.arrayOf(PropTypes.oneOf(['hours'])),
} as any;
