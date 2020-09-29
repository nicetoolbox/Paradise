import { useBackend, useLocalState } from "../backend";
import { Window } from "../layouts";
import { Button, Input, LabeledList, NoticeBox, Section, Box, Flex } from "../components";

const RndRoute = (properties, context) => {
  const { render } = properties;
  const { data } = useBackend(context);
  const { menu, submenu } = data;

  const compare = (comparator, item) => {
    if (comparator === null || comparator === undefined) {
      return true;
    } // unspecified, match all
    if (typeof comparator === 'function') {
      return comparator(item);
    }
    return comparator === item; // strings or ints?
  };

  let match = compare(properties.menu, menu) && compare(properties.submenu, submenu);

  if (!match) {
    return null;
  }

  return render();
};

const RndNavButton = (properties, context) => {
  const { icon, children, disabled, content } = properties;
  const { data, act } = useBackend(context);
  const { menu, submenu } = data;

  let nextMenu = menu;
  let nextSubmenu = submenu;

  if (properties.menu !== null && properties.menu !== undefined) {
    nextMenu = properties.menu;
  }
  if (properties.submenu !== null && properties.submenu !== undefined) {
    nextSubmenu = properties.submenu;
  }

  // const active = data.menu === menu && data.submenu === submenu;

  return (
    <Button
      content={content}
      icon={icon}
      disabled={disabled} onClick={() => {
        act('nav', { menu: nextMenu, submenu: nextSubmenu });
      }}>
      {children}
    </Button>
  );
};

const MainMenu = (properties, context) => {
  const { data } = useBackend(context);

  const {
    disk_type,
    linked_destroy,
    linked_lathe,
    linked_imprinter,
    tech_levels,
  } = data;

  return (
    <Section title="Main Menu">
      <Flex direction="column" align="flex-start">
        <RndNavButton disabled={!disk_type} menu={2} submenu={0} icon="save" content="Disk Operations" />
        <RndNavButton disabled={!linked_destroy} menu={3} submenu={0} icon="unlink"
          content="Destructive Analyzer Menu" />
        <RndNavButton disabled={!linked_lathe} menu={4} submenu={0} icon="print" content="Protolathe Menu" />
        <RndNavButton disabled={!linked_imprinter} menu={5} submenu={0} icon="print"
          content="Circuit Imprinter Menu" />
        <RndNavButton menu={6} submenu={0} icon="cog" content="Settings" />
      </Flex>

      <div style={{ 'margin-top': '12px' }} />
      <h3>Current Research Levels:</h3>
      <LabeledList>
        {tech_levels.map(({ name, level }) => (
          <LabeledList.Item labelColor="yellow" label={name} key={name}>
            {level}
          </LabeledList.Item>
        ))}
      </LabeledList>
    </Section>
  );
};

const CurrentLevels = (properties, context) => {
  const { data } = useBackend(context);

  const {
    tech_levels,
  } = data;

  return (
    <div>
      <h3>Current Research Levels:</h3>
      {tech_levels.map((techLevel, i) => {
        const { name, level, desc } = techLevel;
        return (
          <>
            {i > 0 ? <hr /> : null}
            <div>{name}</div>
            <div>* Level: {level}</div>
            <div>* Summary: {desc}</div>
          </>
        );
      })}
    </div>
  );
};

const DataDiskMenu = (properties, context) => {
  const { data, act } = useBackend(context);

  const { disk_data, disk_type, to_copy } = data;
  const {
    name, level, desc, lathe_types, materials,
  } = disk_data;

  if (!disk_type) {
    return null; // todo what path is this?
  }

  const TechSummary = () => (
    <div>
      <div>Name: {name}</div>
      <div>Level: {level}</div>
      <div>Description: {desc}</div>
      <Button content="Upload to Database" icon="arrow-up" onClick={() => act('updt_tech')} />
      <Button content="Clear Disk" icon="trash" onClick={() => act('clear_tech')} />
    </div>
  );

  const LatheSummary = () => (
    <div>
      <div>Name: {name}</div>
      {lathe_types ? (
        <div>
          Lathe Types:
          {lathe_types.join(', ')}
        </div>
      ) : null}

      <div>Required Materials:</div>

      {materials.map(mat => (
        <div key={mat.name}>{mat.name} x {mat.amount}</div>
      ))}

      <Button
        content="Upload to Database"
        icon="arrow-up"
        onClick={() => act('updt_design')} />

      <Button
        content="Clear Disk"
        icon="trash"
        onClick={() => act('clear_tech')} />

    </div>
  );

  const EmptyDisk = () => {
    return (
      <div>
        <div>This disk is empty.</div>
        <RndNavButton
          submenu={1}
          icon="fa fa-arrow-down"
          content={disk_type === 1
            ? 'Load Tech to Disk'
            : 'Load Design to Disk'}
        />
      </div>
    );
  };

  const ContentsSubmenu = () => (
    <div>
      <h3>Data Disk Contents:</h3>

      {disk_data
        ? (disk_type === 1 ? <TechSummary /> : <LatheSummary />)
        : <EmptyDisk />}

      <Button content="Eject Disk" icon="eject"
        onClick={() => {
          const action = disk_type === 1 ? 'eject_tech' : 'eject_design';
          act(action);
        }} />
    </div>
  );

  const CopySubmenu = () => (
    <div>
      {to_copy.map(({ name, id }) => (
        <div key={id}>
          <div>{name}</div>
          <Button
            icon="arrow-down"
            content="Copy to Disk"
            onClick={() => {
              if (disk_type === 1) {
                act('copy_tech', { id });
              } else {
                act('copy_design', { id });
              }
            }} />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <RndRoute submenu={0} render={() => <ContentsSubmenu />} />
      <RndRoute submenu={1} render={() => <CopySubmenu />} />
    </>
  );
};

const RndNavbar = () => (
  <div>
    <RndRoute menu={n => n !== 0} render={() => (
      <RndNavButton menu={0} submenu={0} icon="fa fa-reply" content="Main Menu" />
    )} />

    {/* Links to return to submenu 0 for each menu other than main menu */}
    <RndRoute submenu={n => n > 0} render={() => (
      <>
        <RndRoute menu={2} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" content="Disk Operations Menu" />
        )} />

        <RndRoute menu={4} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" content="Protolathe Menu" />
        )} />

        <RndRoute menu={5} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" content="Circuit Imprinter Menu" />
        )} />

        <RndRoute menu={6} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" content="Settings Menu" />
        )} />
      </>
    )} />

    <RndRoute menu={n => n === 4 || n === 5} submenu={0} render={() => (
      <>
        <RndNavButton submenu={2} icon="fa fa-arrow-up" content="Material Storage" />
        <RndNavButton submenu={3} icon="fa fa-arrow-up" content="Chemical Storage" />
      </>
    )} />

  </div>
);

const DeconstructionMenu = (properties, context) => {
  const { data, act } = useBackend(context);

  const {
    loaded_item,
    linked_destroy,
  } = data;

  if (!linked_destroy) {
    return (
      <div>
        NO DESTRUCTIVE ANALYZER LINKED TO CONSOLE
      </div>
    );
  }

  if (!loaded_item) {
    return (
      <div>
        No item loaded. Standing by...
      </div>
    );
  }

  return (
    <Section noTopPadding>
      <h3>Deconstruction Menu:</h3>
      <div>Name: {loaded_item.name}</div>
      <h3 style={{ 'margin-top': '10px' }}>Origin Tech:</h3>
      <LabeledList>
        {loaded_item.origin_tech.map(item => {
          return (
            <LabeledList.Item labelColor="yellow" color="yellow" label={"* " + item.name} key={item.name}>
              {item.object_level}
              {" "}
              {item.current_level ? (
                <>(Current: {item.current_level})</>
              ) : null}
            </LabeledList.Item>
          );
        })}

      </LabeledList>
      <h3 style={{ 'margin-top': '10px' }}>Options:</h3>
      <Button
        icon="unlink"
        onClick={() => {
          act('deconstruct');
        }}>
        Deconstruct Item
      </Button>
      <Button
        onClick={() => {
          act('eject_item');
        }}>
        <i className="fa fa-eject" />
        Eject Item
      </Button>
    </Section>
  );
};

const LatheSearch = (properties, context) => {
  const { act } = useBackend(context);

  const [inputValue, setInputValue] = useLocalState(context, 'inputValue', '');

  const onSubmit = e => {
    e.preventDefault();
    act('search', { to_search: inputValue });
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        onInput={(e, value) => setInputValue(value)} />
      <button type="submit">Search</button>
    </form>
  );
};

const LatheMaterials = (properties, context) => {
  const { data } = useBackend(context);

  const {
    total_materials,
    max_materials,
    max_chemicals,
    total_chemicals,
  } = data;

  return (
    <div style={{ 'margin': '0 0 10px 0' }}>
      <Box color="yellow">
        <table>
          <tr>
            <td style={{ 'font-weight': 'bold' }}>Material Amount:</td>
            <td>{total_materials}</td>
            {max_materials ? (
              <td>
                {" / " + max_materials}
              </td>
            ) : null}
          </tr>
          <tr>
            <td style={{ 'font-weight': 'bold' }}>Chemical Amount:</td>
            <td>{total_chemicals}</td>
            {max_chemicals ? (
              <td>
                {" / " + max_chemicals}

              </td>
            ) : null}
          </tr>
        </table>
      </Box>
    </div>

  );
};

const LatheMainMenu = (properties, context) => {
  const { data, act } = useBackend(context);

  const {
    menu,
    categories,
  } = data;

  const label = menu === 4 ? 'Protolathe' : 'Circuit Imprinter';

  return (
    <Section title={label + " Menu"}>
      <LatheMaterials />
      <LatheSearch />

      <hr />

      <Flex wrap="wrap">
        {categories.map(cat => (
          <Flex key={cat} style={{
            'flex-basis': '50%',
            'margin-bottom': '6px',
          }}>
            <Button
              icon="arrow-right"
              content={cat}
              onClick={() => {
                act('setCategory', { category: cat });
              }} />
          </Flex>
        ))}
      </Flex>

    </Section>
  );
};

// Also handles search results
const LatheCategory = (properties, context) => {
  const { data, act } = useBackend(context);

  const {
    category,
    matching_designs,
    menu,
  } = data;

  const lathe = menu === 4;
  // imprinter current ignores amount, only prints 1, always can_build 1 or 0
  const action = lathe ? 'build' : 'imprint';

  return (
    <Section title={category}>
      <LatheMaterials />
      <table>
        {matching_designs.map(({ id, name, can_build, materials }) => {
          return (
            <tr key={id}>
              <td>
                <Button
                  icon="print"
                  content={name}
                  disabled={!can_build}
                  onClick={() => act(action, { id, amount: 1 })} />
              </td>
              <td>
                {can_build >= 5 ? (
                  <Button
                    content="x5"
                    onClick={() => act(action, { id, amount: 5 })} />
                ) : null}
              </td>
              <td>
                {can_build >= 10 ? (
                  <Button
                    content="x10"
                    onClick={() => act(action, { id, amount: 10 })} />
                ) : null}
              </td>
              <td>
                {materials.map(mat => (
                  <>
                    {" | "}
                    <span className={mat.is_red ? 'color-red' : null}>
                      {mat.amount} {mat.name}
                    </span>
                  </>
                ))}
              </td>
            </tr>
          );
        })}
      </table>
    </Section>
  );
};

const LatheMaterialStorage = (properties, context) => {
  const { data, act } = useBackend(context);
  const { loaded_materials } = data;
  return (
    <Section title="Material Storage">
      <table className="color-yellow">
        {loaded_materials.map(({ id, amount, name }) => {
          const eject = amount => {
            const action = data.menu === 4 ? 'lathe_ejectsheet' : 'imprinter_ejectsheet';
            act(action, { id, amount });
          };
          // 1 sheet = 2000 units
          // const sheets = Math.round((amount / 2000) * 10) / 10; // todo what precision?
          const sheets = Math.floor((amount / 2000)); // todo what precision?
          const plural = sheets === 1 ? '' : 's';
          return (
            <tr key={id}>
              <td style={{ 'min-width': '210px' }}>
                * {amount} of {name}
              </td>
              <td style={{ 'min-width': '110px' }}>
                ({sheets} sheet{plural})
              </td>
              <td>
                {amount >= 2000 ? (
                  <>
                    <Button content="1x" icon="eject" onClick={() => eject(1)} />
                    <Button content="C" icon="eject" onClick={() => eject('custom')} />
                    {amount >= 2000 * 5 ? (
                      <Button content="5x" icon="eject" onClick={() => eject(5)} />
                    ) : null}
                    <Button content="All" icon="eject" onClick={() => eject(50)} />
                  </>
                ) : null}
              </td>
            </tr>
          );
        })}
      </table>
    </Section>
  );
};

const LatheChemicalStorage = (properties, context) => {
  const { data, act } = useBackend(context);

  const {
    loaded_chemicals,
  } = data;

  const lathe = data.menu === 4;

  return (
    <Section title="Chemical Storage">

      <Button
        content="Purge All"
        icon="trash"
        onClick={() => {
          const action = lathe ? 'disposeallP' : 'disposeallI';
          act(action);
        }} />

      <LabeledList>
        {loaded_chemicals.map(({ volume, name, id }) => (
          <LabeledList.Item labelColor="yellow" label={`* ${volume} of ${name}`} key={id}>
            <Button
              content="Purge"
              icon="trash"
              onClick={() => {
                const action = lathe ? 'disposeP' : 'disposeI';
                act(action, { id });
              }} />
          </LabeledList.Item>
        ))}
      </LabeledList>

    </Section>
  );
};

const LatheMenu = (properties, context) => {
  const { data } = useBackend(context);

  const {
    menu,
    linked_lathe,
    linked_imprinter,
  } = data;

  if (menu === 4 && !linked_lathe) {
    return (
      <div>
        NO PROTOLATHE LINKED TO CONSOLE
      </div>
    );
  }

  if (menu === 5 && !linked_imprinter) {
    return (
      <div>
        NO CIRCUIT IMPRITER LINKED TO CONSOLE
      </div>
    );
  }

  return (
    <div>
      <RndRoute submenu={0} render={() => <LatheMainMenu />} />
      <RndRoute submenu={1} render={() => <LatheCategory />} />
      <RndRoute submenu={2} render={() => <LatheMaterialStorage />} />
      <RndRoute submenu={3} render={() => <LatheChemicalStorage />} />
    </div>
  );
};

const SettingsMenu = (properties, context) => {
  const { data, act } = useBackend(context);

  const {
    sync,
    admin,
    linked_destroy,
    linked_lathe,
    linked_imprinter,
  } = data;

  return (
    <div>
      <RndRoute submenu={0} render={() => (
        <Section title="Settings">
          <Flex direction="column" align="flex-start">
            <Button
              disabled={!sync}
              onClick={() => {
                act('sync');
              }}>
              <i className="fa fa-sync" />
              Sync Database with Network
            </Button>

            <Button
              disabled={sync}
              onClick={() => {
                act('togglesync');
              }}>
              <i className="fa fa-plug" />
              Connect to Research Network
            </Button>

            <Button
              disabled={!sync}
              icon="unlink"
              content="Disconnect from Research Network"
              onClick={() => {
                act('togglesync');
              }} />

            <RndNavButton
              disabled={!sync}
              content="Device Linkage Menu"
              icon="link"
              menu={6} submenu={1}
            />

            {admin === 1 ? (
              <Button
                icon="exclamation"
                content="[ADMIN] Maximize Research Levels"
                onClick={() => act('maxresearch')} />
            ) : null}
          </Flex>
        </Section>
      )} />

      <RndRoute submenu={1} render={() => (
        <Section title="Device Linkage Menu">
          <Button
            icon="link"
            content="Re-sync with Nearby Devices"
            onClick={() => act('find_device')} />

          <h3 style={{ 'margin-top': '5px' }}>Linked Devices:</h3>
          <LabeledList>

            {linked_destroy ? (
              <LabeledList.Item labelColor="yellow" label="* Destructive Analyzer">
                <Button
                  icon="unlink"
                  content="Unlink"
                  onClick={() => act('disconnect', { item: 'destroy' })} />
              </LabeledList.Item>
            ) : (
              <LabeledList.Item noColon labelColor="yellow" label="* No Destructive Analyzer Linked" />
            )}

            {linked_lathe ? (
              <LabeledList.Item labelColor="yellow" label="* Protolathe">
                <Button
                  icon="unlink"
                  content="Unlink"
                  onClick={() => {
                    act('disconnect', { item: 'lathe' });
                  }} />
              </LabeledList.Item>
            ) : (
              <LabeledList.Item noColon labelColor="yellow" label="* No Protolathe Linked" />
            )}

            {linked_imprinter ? (
              <LabeledList.Item labelColor="yellow" label="* Circuit Imprinter">
                <Button
                  icon="unlink"
                  content="Unlink"
                  onClick={() => act('disconnect', { item: 'imprinter' })} />
              </LabeledList.Item>
            ) : (
              <LabeledList.Item noColon labelColor="yellow" label="* No Circuit Imprinter Linked" />
            )}

          </LabeledList>
        </Section>
      )} />
    </div>
  );
};

export const RndConsole = (properties, context) => {
  const { data } = useBackend(context);
  const { wait_message } = data;

  return (
    <Window>
      <Window.Content>
        <div className="RndConsole">
          <RndNavbar />
          <RndRoute menu={0} render={() => <MainMenu />} />
          <RndRoute menu={1} render={() => <CurrentLevels />} />
          <RndRoute menu={2} render={() => <DataDiskMenu />} />
          <RndRoute menu={3} render={() => <DeconstructionMenu />} />
          <RndRoute menu={n => n === 4 || n === 5} render={() => <LatheMenu />} />
          <RndRoute menu={6} render={() => <SettingsMenu />} />
          {wait_message ? (
            <div className="RndConsole__Overlay">
              <div className="RndConsole__Overlay__Wrapper">
                <NoticeBox info>
                  {wait_message}
                </NoticeBox>
              </div>
            </div>
          ) : null}
        </div>
      </Window.Content>
    </Window>
  );
};
