import { useBackend, useLocalState } from "../backend";
import { Window } from "../layouts";
import { Button, Input } from "../components";

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
  const { icon, label, children, disabled } = properties;
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
    <Button disabled={disabled} onClick={() => {
      act('nav', { menu: nextMenu, submenu: nextSubmenu });
    }}>
      {icon ? <i className={icon} /> : null}
      {label}
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
    <div>
      <h3>Main Menu</h3>
      <RndNavButton disabled={!disk_type} menu={2} submenu={0} icon="fa fa-save" label="Disk Operations" />
      <RndNavButton disabled={!linked_destroy} menu={3} submenu={0} icon="fa fa-chain-broken"
        label="Destructive Analyzer Menu" />
      <RndNavButton disabled={!linked_lathe} menu={4} submenu={0} icon="fa fa-print" label="Protolathe Menu" />
      <RndNavButton disabled={!linked_imprinter} menu={5} submenu={0} icon="fa fa-print"
        label="Circuit Imprinter Menu" />
      <RndNavButton menu={6} submenu={0} icon="fa fa-gear" label="Settings" />

      <br />
      <br />
      <h3>Current Research Levels</h3>
      {tech_levels.map(({ name, level }, i) => (
        <div key={name}>
          {i > 0 ? <hr /> : null}
          <div>
            {name}: {level}
          </div>
        </div>
      ))}
    </div>
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

  if (!disk_type) {
    return null; // todo what path is this?
  }

  const TechSummary = () => {
    return (
      <div>
        <div>Name: {disk_data.name}</div>
        <div>Level: {disk_data.level}</div>
        <div>Description: {disk_data.desc}</div>
        <Button content="Upload to Database" icon="arrow-up" onClick={() => act('updt_tech')} />
        <Button content="Clear Disk" label="trash" onClick={() => act('clear_tech')} />
      </div>
    );
  };

  const LatheSummary = () => {
    return (
      <div>
        <div>Name: {disk_data.name}</div>
        {disk_data.lathe_types ? (
          <div>
            Lathe Types:
            {disk_data.lathe_types.join(', ')}
          </div>
        ) : null}

        <div>Required Materials:</div>

        {disk_data.materials.map(mat => {
          return (
            <div key={mat.name}>{mat.name} x {mat.amount}</div>
          );
        })}


        <Button onClick={() => {
          act('updt_design');
        }}>
          <i className="fa fa-arrow-up" />
          Upload to Database
        </Button>

        <Button onClick={() => {
          act('clear_tech');
        }}>
          <i className="fa trash" />
          Clear Disk
        </Button>

      </div>
    );
  };

  const EmptyDisk = () => {
    return (
      <div>
        <div>This disk is empty.</div>
        <RndNavButton
          submenu={1}
          icon="fa fa-arrow-down"
          label={disk_type === 1
            ? 'Load Tech to Disk'
            : 'Load Design to Disk'}
        />
      </div>
    );
  };

  const ContentsSubmenu = () => {
    return (
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
  };

  const CopySubmenu = () => {
    return (
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
  };

  return (
    <>
      <RndRoute submenu={0} render={() => <ContentsSubmenu />} />
      <RndRoute submenu={1} render={() => <CopySubmenu />} />
    </>
  );
};

const RndNavbar = () => (
  <div>
    <RndNavButton menu={0} submenu={0} icon="fa fa-reply" label="Main Menu" />

    {/* Links to return to submenu 0 for each menu other than main menu */}
    <RndRoute submenu={n => n > 0} render={() => (
      <>
        <RndRoute menu={2} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" label="Disk Operations Menu" />
        )} />

        <RndRoute menu={4} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" label="Protolathe Menu" />
        )} />

        <RndRoute menu={5} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" label="Circuit Imprinter Menu" />
        )} />

        <RndRoute menu={6} render={() => (
          <RndNavButton submenu={0} icon="fa fa-reply" label="Settings Menu" />
        )} />
      </>
    )} />

    <RndRoute menu={n => n === 4 || n === 5} submenu={0} render={() => (
      <>
        <RndNavButton submenu={2} icon="fa fa-arrow-up" label="Material Storage" />
        <RndNavButton submenu={3} icon="fa fa-arrow-up" label="Chemical Storage" />
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
    <div>
      <h3>Deconstruction Menu:</h3>
      <div>Name: {loaded_item.name}</div>
      <h3>Origin Tech:</h3>
      {loaded_item.origin_tech.map(item => {
        return (
          <div key={item.name}>
            <div>* {item.name}</div>
            <div>
              {item.object_level}
              {item.current_level ? (
                <>(Current: {item.current_level})</>
              ) : null}
            </div>
          </div>
        );
      })}
      <h3>Options:</h3>
      <Button
        onClick={() => {
          act('deconstruct');
        }}>
        <i className="fa fa-chain-broken" />
        Deconstruct Item
      </Button>
      <Button
        onClick={() => {
          act('eject_item');
        }}>
        <i className="fa fa-eject" />
        Eject Item
      </Button>
    </div>
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


const LatheMenu = (properties, context) => {
  const { data, act } = useBackend(context);

  const {
    menu,
    submenu,
    category,
    categories, loaded_materials,
    matching_designs, loaded_chemicals,
    total_materials,
    max_materials,
    max_chemicals,
    total_chemicals,
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
      {submenu === 0 ? (
        <h3>{menu === 4 ? 'Protolathe' : 'Circuit Imprinter'} Menu:</h3>
      ) : null}
      {submenu === 1 ? (
        <h3>{category}</h3>
      ) : null}
      {submenu === 2 ? (
        <h3>Material Stroage:</h3>
      ) : null}
      {submenu === 3 ? (
        <h3>Chemical Storage:</h3>
      ) : null}

      {submenu < 2 ? (
        <div>
          <table>
            <tr>
              <td>
                <b>Material Amount:</b>
              </td>
              <td>
                {total_materials}
              </td>
              {max_materials ? (
                <td>{max_materials}</td>
              ) : null}
            </tr>
            <tr>
              <td><b>Chemical Amount:</b></td>
              <td>{total_chemicals}</td>
              {max_chemicals ? (
                <td>{max_chemicals}</td>
              ) : null}
            </tr>
          </table>
        </div>
      ) : null}

      {submenu === 0 ? (
        <div>
          <LatheSearch />

          <hr />

          <table>
            {categories.map(cat => {
              // todo flex wrap? 2 cols
              return (
                <tr key={cat}>
                  <td>
                    <Button
                      onClick={() => {
                        act('setCategory', { category: cat });
                      }}>
                      <i className="fa fa-arrow-right" />
                      {cat}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </table>

        </div>

      ) : null}

      {submenu === 1 ? (
        <table>
          {matching_designs.map(value => {
            return (
              <tr key={value.id}>
                <td>
                  <Button
                    disabled={!value.can_build}
                    onClick={() => {
                      if (data.menu === 4) {
                        act('build', { id: value.id, amount: 1 });
                      } else {
                        act('imprint', { id: value.id });
                      }
                    }}>
                    <i className="fa fa-print" />
                    {value.name}
                  </Button>
                </td>
                <td>
                  {value.can_build >= 5 ? (
                    <Button
                      onClick={() => {
                        if (data.menu === 4) {
                          act('build', { id: value.id, amount: 5 });
                        } else {
                          act('imprint', { id: value.id }); // dead code path?
                        }
                      }}>
                      <i className="fa fa-print" />
                      x5
                    </Button>
                  ) : null}
                </td>
                <td>
                  {value.can_build >= 10 ? (
                    <Button
                      onClick={() => {
                        if (data.menu === 4) {
                          act('build', { id: value.id, amount: 10 });
                        } else {
                          act('imprint', { id: value.id }); // dead code path?
                        }
                      }}>
                      <i className="fa fa-print" />
                      x10
                    </Button>
                  ) : null}
                </td>
                <td>
                  {value.materials.map(mat => {
                    return (
                      <>
                        |
                        <span className={mat.is_red ? 'bad' : null}>
                          {mat.amount} {mat.name}
                        </span>

                      </>
                    );
                  })}
                </td>


              </tr>
            );
          })}
        </table>
      ) : null}

      {submenu === 2 ? (
        <div>
          {loaded_materials.map(value => {
            const eject = amount => {
              if (data.menu === 4) {
                act('lathe_ejectsheet', { id: value.id, amount });
              } else {
                act('imprinter_ejectsheet', { id: value.id, amount });
              }
            };
            return (
              <div key={value.id}>
                <div>* {value.amount} of {value.name}</div>
                <div>({Math.round((value.amount / 2000) * 10) / 10} sheets)</div>
                {value.amount >= 2000 ? (
                  <div>
                    <Button onClick={() => {
                      eject(1);
                    }}>
                      <i className="fa fa-eject" />
                      1x
                    </Button>
                    <Button onClick={() => {
                      eject('custom'); // todo!!
                    }}>
                      <i className="fa fa-eject" />
                      C (TODO!!)
                    </Button>
                    {value.amount >= 2000 * 5 ? (

                      <Button onClick={() => {
                        eject(5);
                      }}>
                        <i className="fa fa-eject" />
                        5x
                      </Button>
                    ) : null}

                    <Button onClick={() => {
                      eject(50);
                    }}>
                      <i className="fa fa-eject" />
                      All
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {submenu === 3 ? (
        <div>

          <Button onClick={() => {
            if (data.menu === 4) {
              act('disposeallP');
            } else {
              act('disposeallI');
            }
          }}>
            <i className="fa fa-trash" />
            Purge All
          </Button>

          {loaded_chemicals.map(value => {

            return (
              <div key={value.id}>
                <div>* {value.volume} of {value.name}</div>
                <Button onClick={() => {
                  if (data.menu === 4) {
                    act('disposeP', { id: value.id });
                  } else {
                    act('disposeI', { id: value.id });
                  }
                }}>
                  <i className="fa fa-trash" />
                  Purge
                </Button>
              </div>
            );
          })}

        </div>
      ) : null}


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
        <div>
          <h3>Settings:</h3>
          <div>
            <Button
              disabled={!sync}
              onClick={() => {
                act('sync');
              }}>
              <i className="fa fa-refresh" />
              Sync Database with Network
            </Button>

            <Button
              selected={sync}
              onClick={() => {
                act('togglesync');
              }}>
              <i className="fa fa-plug" />
              Connect to Research Network
            </Button>

            <Button
              selected={!sync}
              onClick={() => {
                act('togglesync');
              }}>
              <i className="fa fa-chain-broken" />
              Disconnect from Research Network
            </Button>

            <Button
              disabled={!sync}
              onClick={() => {
                act('nav', { menu: 6, submenu: 1 });
              }}>
              <i className="fa fa-chain" />
              Device Linkage Menu
            </Button>

            {admin === 1 ? (
              <Button onClick={() => {
                act('maxresearch');
              }}>
                <i className="fa fa-exclamation" />
                [ADMIN] Maximize Research Levels
              </Button>
            ) : null}
          </div>
        </div>
      )} />

      <RndRoute submenu={1} render={() => (
        <div>
          <h3>Device Linkage Menu:</h3>
          <div>
            <Button onClick={() => {
              act('find_device');
            }}>
              <i className="fa fa-chain" />
              Re-sync with Nearby Devices
            </Button>
          </div>
          <h3>Linked Devices:</h3>
          <div>
            {linked_destroy ? (
              <>
                <div className="itemLabel">* Destructive Analyzer</div>
                <Button onClick={() => {
                  act('disconnect', { item: 'destroy' });
                }}>
                  <i className="fa fa-chain-broken" />
                  Unlink
                </Button>
              </>
            ) : (
              <div>
                * No Destructive Analyzer Linked
              </div>
            )}
          </div>
          <div>
            {linked_lathe ? (
              <>
                <div className="itemLabel">* Protolathe</div>
                <Button onClick={() => {
                  act('disconnect', { item: 'lathe' });
                }}>
                  <i className="fa fa-chain-broken" />
                  Unlink
                </Button>
              </>
            ) : (
              <div>
                * No Protolathe Linked
              </div>
            )}

          </div>
          <div>
            {linked_imprinter ? (
              <>
                <div className="itemLabel">* Circuit Imprinter</div>
                <Button onClick={() => {
                  act('disconnect', { item: 'imprinter' });
                }}>
                  <i className="fa fa-chain-broken" />
                  Unlink
                </Button>
              </>
            ) : (
              <div>
                * No Circuit Imprinter Linked
              </div>
            )}

          </div>

        </div>
      )} />
    </div>
  );
};

export const RndConsole = (properties, context) => {
  const { data } = useBackend(context);

  const {
    wait_message,
  } = data;


  return (
    <Window>
      <Window.Content>

        <RndNavbar />


        <RndRoute menu={0} render={() => <MainMenu />} />
        <RndRoute menu={1} render={() => <CurrentLevels />} />
        <RndRoute menu={2} render={() => <DataDiskMenu />} />
        <RndRoute menu={3} render={() => <DeconstructionMenu />} />
        <RndRoute menu={n => n === 4 || n === 5} render={() => <LatheMenu />} />
        <RndRoute menu={6} render={() => <SettingsMenu />} />

        {wait_message ? (
          <div>
            <div>
              <h1>{wait_message}</h1>
            </div>
          </div>
        ) : null}

      </Window.Content>

    </Window>
  );

};
